import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { getStripe } from '@/lib/stripe';

interface OrderRow {
  id: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  currency: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  status: string;
  paymentStatus: string;
  shippingRegion: string | null;
}

interface OrderItemRow {
  productSlug: string;
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export async function POST(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database not available', 503);

    const {
      orderId,
      sendEmail = true,
      dueInDays = 30,
    } = (await request.json()) as {
      orderId: string;
      sendEmail?: boolean;
      dueInDays?: number;
    };

    if (!orderId) return apiJsonError('orderId required', 400);

    const stripe = getStripe();

    // Load order + items
    const order = await db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .bind(orderId)
      .first<OrderRow>();
    if (!order) return apiJsonError('Order not found', 404);
    if (order.paymentStatus === 'paid') {
      return apiJsonError('Order is already paid', 409);
    }

    const itemsResult = await db
      .prepare('SELECT * FROM order_items WHERE orderId = ?')
      .bind(orderId)
      .all<OrderItemRow>();
    const items = itemsResult.results ?? [];

    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email: order.customerEmail, limit: 1 });
    const stripeCustomer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: order.customerEmail,
        name: order.customerName,
        metadata: { company: order.customerCompany ?? '', orderId },
      }));

    const currency = order.currency.toLowerCase();

    // Build invoice line items (amount = total for that line, quantity = 1)
    await Promise.all(
      items.map(async (item) => {
        return stripe.invoiceItems.create({
          customer: stripeCustomer.id,
          currency,
          amount: Math.round(item.unitPrice * item.qty * 100), // cents, total for line
          description: `${item.productName} — ${item.qty} ${item.unit} @ ${currency.toUpperCase()} ${item.unitPrice.toFixed(2)}/${item.unit}`,
        });
      })
    );

    // Add shipping as a line item if applicable
    if (order.shippingCost > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomer.id,
        currency,
        amount: Math.round(order.shippingCost * 100),
        description: `Shipping${order.shippingRegion ? ` — ${order.shippingRegion}` : ''}`,
      });
    }

    // Create invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueInDays);

    const invoice = await stripe.invoices.create({
      customer: stripeCustomer.id,
      currency,
      collection_method: 'send_invoice',
      days_until_due: dueInDays,
      description: `Order ${order.referenceId} — Covestro Polycarbonates`,
      footer: 'Thank you for your business. Payment is due within the specified terms.',
      metadata: { orderId, referenceId: order.referenceId },
      custom_fields: [
        { name: 'Order Reference', value: order.referenceId },
        ...(order.customerCompany ? [{ name: 'Company', value: order.customerCompany }] : []),
      ],
    });

    // Finalise the invoice (locks amounts)
    const finalised = await stripe.invoices.finalizeInvoice(invoice.id);

    // Optionally email it directly via Stripe
    if (sendEmail) {
      await stripe.invoices.sendInvoice(finalised.id);
    }

    // Store invoice ID on the order
    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE orders SET paymentStatus = 'partial', updatedAt = ? WHERE id = ? AND paymentStatus = 'unpaid'`
      )
      .bind(now, orderId)
      .run();

    // Record in payments table
    const paymentId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO payments (id, orderId, amount, currency, method, status, stripeInvoiceId, createdAt)
       VALUES (?, ?, ?, ?, 'stripe', 'pending', ?, ?)`
      )
      .bind(paymentId, orderId, order.total, order.currency, finalised.id, now)
      .run();

    return NextResponse.json({
      ok: true,
      invoiceId: finalised.id,
      invoiceUrl: finalised.hosted_invoice_url,
      invoicePdf: finalised.invoice_pdf,
      emailSent: sendEmail,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Stripe error';
    console.error('POST /api/stripe/invoice:', error);
    return apiJsonError(msg, 500);
  }
}
