/**
 * GET /api/track?ref=ORD-XXX&email=foo@bar.com
 * Public endpoint — no auth required.
 * Returns order details if the reference ID + email pair match a record.
 */
import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

interface OrderRow {
  id: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  shippingRegion?: string;
  createdAt: string;
  updatedAt: string;
}

interface ItemRow {
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

// Status progression for timeline
const STATUS_FLOW = [
  {
    key: 'pending',
    label: 'Order Received',
    desc: 'Your order has been submitted and is awaiting review.',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    desc: 'Your order has been confirmed and is in our queue.',
  },
  {
    key: 'processing',
    label: 'Processing',
    desc: 'Our team is preparing your order for dispatch.',
  },
  { key: 'shipped', label: 'Shipped', desc: 'Your order is on its way to you.' },
  { key: 'delivered', label: 'Delivered', desc: 'Your order has been delivered.' },
];

const CANCELLED_STEP = {
  key: 'cancelled',
  label: 'Cancelled',
  desc: 'This order has been cancelled.',
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ref = searchParams.get('ref')?.trim().toUpperCase();
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!ref || !email) {
    return apiJsonError('Reference ID and email are required.', 400);
  }

  const db = await getD1();
  if (!db) {
    return apiJsonError('Service temporarily unavailable.', 503);
  }

  // Look up the order — both fields must match
  const order = await db
    .prepare(
      `SELECT id, referenceId, customerName, customerEmail, customerCompany,
              total, currency, status, paymentStatus, shippingRegion, createdAt, updatedAt
       FROM orders
       WHERE UPPER(referenceId) = ?
         AND LOWER(customerEmail) = ?`
    )
    .bind(ref, email)
    .first<OrderRow>();

  if (!order) {
    // Also try quotes table for quote references
    const quote = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerEmail, customerCompany,
                currency, status, submittedAt as createdAt, updatedAt
         FROM quotes
         WHERE UPPER(referenceId) = ?
           AND LOWER(customerEmail) = ?`
      )
      .bind(ref, email)
      .first<{
        id: string;
        referenceId: string;
        customerName: string;
        customerEmail: string;
        customerCompany?: string;
        currency: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>();

    if (quote) {
      return NextResponse.json({
        type: 'quote',
        referenceId: quote.referenceId,
        customerName: quote.customerName,
        customerCompany: quote.customerCompany,
        currency: quote.currency,
        status: quote.status,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
        quoteStatusMap: {
          pending: 'Under Review — our team will respond within 1 business day.',
          reviewed: 'Reviewed — our team has reviewed your request.',
          quoted: 'Quote Ready — pricing has been prepared. Check your email.',
          accepted: "Accepted — thank you! We'll convert this to an order shortly.",
          rejected: 'Declined — please contact us to discuss alternatives.',
          converted: 'Converted — this quote has been converted to an order.',
        },
      });
    }

    return NextResponse.json(
      { error: 'No record found. Please check your reference ID and email address.' },
      { status: 404 }
    );
  }

  // Fetch line items
  const itemsResult = await db
    .prepare(
      `SELECT productName, qty, unit, unitPrice, lineTotal
       FROM order_items WHERE orderId = ?`
    )
    .bind(order.id)
    .all<ItemRow>();

  const items = itemsResult.results ?? [];

  // Build timeline
  const isCancelled = order.status === 'cancelled';
  const steps = isCancelled ? [...STATUS_FLOW, CANCELLED_STEP] : STATUS_FLOW;
  const activeIdx = steps.findIndex((s) => s.key === order.status);

  const timeline = steps.map((step, i) => ({
    ...step,
    done: isCancelled ? step.key === 'cancelled' : i <= activeIdx,
    active: step.key === order.status,
  }));

  return NextResponse.json({
    type: 'order',
    referenceId: order.referenceId,
    customerName: order.customerName,
    customerCompany: order.customerCompany,
    total: order.total,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    shippingRegion: order.shippingRegion,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items,
    timeline,
  });
}
