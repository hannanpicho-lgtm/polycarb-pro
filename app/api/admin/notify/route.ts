import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { Resend } from 'resend';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

interface OrderRow {
  id: string; referenceId: string;
  customerName: string; customerEmail: string; customerCompany?: string;
  total: number; currency: string; status: string; paymentStatus: string;
  shippingRegion?: string; createdAt: string;
}

interface NotifyItem {
  productName: string; qty: number; unit: string; unitPrice: number;
}

const STATUS_SUBJECT: Record<string, string> = {
  confirmed:  'Your order has been confirmed',
  processing: 'Your order is being processed',
  shipped:    'Great news — your order has shipped!',
  delivered:  'Your order has been delivered',
  cancelled:  'Your order has been cancelled',
};

const STATUS_INTRO: Record<string, string> = {
  confirmed:  "We've confirmed your order and it's now in our queue.",
  processing: "Our team is actively preparing your order for dispatch.",
  shipped:    "Your order is on its way! Expect delivery within the timeframe agreed for your region.",
  delivered:  "Your order has been marked as delivered. We hope everything arrived in perfect condition.",
  cancelled:  "Your order has been cancelled. If you believe this is an error, please contact us.",
};

function buildOrderEmail(order: OrderRow, items: NotifyItem[], customNote?: string): string {
  const currencyLabel = order.currency.toUpperCase();
  const formatAmt = (n: number) => `${currencyLabel} ${n.toFixed(2)}`;
  const subject = STATUS_SUBJECT[order.status] ?? `Order update: ${order.referenceId}`;
  const intro = STATUS_INTRO[order.status] ?? 'Your order has been updated.';

  const itemRows = items.length > 0
    ? items.map(i =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">${i.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center">${i.qty} ${i.unit}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:right">${formatAmt(i.unitPrice * i.qty)}</td>
        </tr>`).join('')
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr>
    <td style="background:#0087C3;padding:28px 32px;border-radius:12px 12px 0 0">
      <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Covestro Polycarbonates</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;line-height:1.3">${subject}</h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
      <p style="margin:0 0 16px;font-size:15px;color:#374151">Hi ${order.customerName.split(' ')[0]},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">${intro}</p>

      ${customNote ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#0369a1;font-style:italic">"${customNote}"</p>
      </div>` : ''}

      <!-- Order summary -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px">
        <tr style="background:#f8fafc">
          <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em" colspan="3">Order ${order.referenceId}</td>
        </tr>
        ${itemRows ? `<tr style="background:#f8fafc">
          <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#94a3b8;text-align:left;border-bottom:1px solid #e2e8f0">Product</th>
          <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#94a3b8;text-align:center;border-bottom:1px solid #e2e8f0">Qty</th>
          <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#94a3b8;text-align:right;border-bottom:1px solid #e2e8f0">Total</th>
        </tr>
        <tbody>${itemRows}</tbody>` : ''}
        <tr>
          <td colspan="2" style="padding:12px;font-weight:700;font-size:14px;color:#1e293b;text-align:right;border-top:1px solid #e2e8f0">Order Total</td>
          <td style="padding:12px;font-weight:800;font-size:15px;color:#0087C3;text-align:right;border-top:1px solid #e2e8f0">${formatAmt(order.total)}</td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:12px;color:#94a3b8">If you have questions about this order, please reply to this email or contact your account manager.</p>
      <p style="margin:0;font-size:12px;color:#94a3b8">Thank you for choosing Covestro Polycarbonates.</p>
    </td>
  </tr>

  <!-- Footer -->
  <tr><td style="padding:20px 0;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">© 2026 Covestro Polycarbonates · <a href="https://covestroppc.com" style="color:#0087C3;text-decoration:none">covestroppc.com</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

/** POST /api/admin/notify
 *  Body: { orderId: string, customNote?: string }
 *  Sends an order status email to the customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customNote } = body as { orderId: string; customNote?: string };

    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const order = await db
      .prepare(`SELECT id, referenceId, customerName, customerEmail, customerCompany,
                  total, currency, status, paymentStatus, shippingRegion, createdAt
                FROM orders WHERE id = ?`)
      .bind(orderId)
      .first<OrderRow>();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (!order.customerEmail) return NextResponse.json({ error: 'No customer email on this order' }, { status: 422 });

    const itemsResult = await db
      .prepare(`SELECT productName, qty, unit, unitPrice FROM order_items WHERE orderId = ?`)
      .bind(orderId)
      .all<NotifyItem>();
    const items = itemsResult.results ?? [];

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 });

    const resend = new Resend(resendKey);
    const subject = STATUS_SUBJECT[order.status] ?? `Order update — ${order.referenceId}`;
    const html = buildOrderEmail(order, items, customNote);

    const { error: resendErr } = await resend.emails.send({
      from: 'Covestro Polycarbonates <orders@covestroppc.com>',
      to: [order.customerEmail],
      subject,
      html,
    });

    if (resendErr) {
      console.error('[notify] Resend error:', resendErr);
      return NextResponse.json({ error: 'Email send failed', detail: resendErr }, { status: 502 });
    }

    // Record notification in DB (best effort)
    try {
      await db.prepare(
        `UPDATE orders SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
      ).bind(orderId).run();
    } catch {}

    return NextResponse.json({ ok: true, sentTo: order.customerEmail, subject });
  } catch (err) {
    console.error('[notify] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
