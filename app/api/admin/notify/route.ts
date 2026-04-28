/**
 * POST /api/admin/notify
 * Body: { orderId, customNote? }
 * Sends an order status email to the customer using the shared template.
 */
import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { sendOrderStatusEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customNote } = (await request.json()) as {
      orderId: string;
      customNote?: string;
    };

    if (!orderId) return apiJsonError('orderId required', 400);

    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const order = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerEmail,
                total, currency, status, trackingNumber
         FROM orders WHERE id = ?`
      )
      .bind(orderId)
      .first<{
        id: string;
        referenceId: string;
        customerName: string;
        customerEmail: string;
        total: number;
        currency: string;
        status: string;
        trackingNumber?: string;
      }>();

    if (!order) return apiJsonError('Order not found', 404);
    if (!order.customerEmail) return apiJsonError('No email on this order', 422);

    const itemsResult = await db
      .prepare('SELECT productName, qty, unit, unitPrice FROM order_items WHERE orderId = ?')
      .bind(orderId)
      .all<{ productName: string; qty: number; unit: string; unitPrice: number }>();

    const { ok, error: emailErr } = await sendOrderStatusEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      referenceId: order.referenceId,
      status: order.status,
      total: order.total,
      currency: order.currency,
      trackingNumber: order.trackingNumber ?? undefined,
      customNote,
      items: itemsResult.results ?? [],
    });

    if (!ok) {
      console.error('[notify] Email error:', emailErr);
      return apiJsonError('Email send failed', 502, { detail: emailErr });
    }

    return NextResponse.json({ ok: true, sentTo: order.customerEmail });
  } catch (err) {
    console.error('[notify]', err);
    return apiJsonError('Internal error', 500);
  }
}
