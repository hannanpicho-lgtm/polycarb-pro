/**
 * POST /api/admin/notify
 * Body: { orderId, customNote? }
 * Sends an order status email to the customer using the shared template.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { sendOrderStatusEmail } from '@/lib/email';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, customNote } = await request.json() as {
      orderId: string;
      customNote?: string;
    };

    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const order = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerEmail,
                total, currency, status, trackingNumber
         FROM orders WHERE id = ?`
      )
      .bind(orderId)
      .first<{
        id: string; referenceId: string; customerName: string;
        customerEmail: string; total: number; currency: string;
        status: string; trackingNumber?: string;
      }>();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (!order.customerEmail) return NextResponse.json({ error: 'No email on this order' }, { status: 422 });

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
      return NextResponse.json({ error: 'Email send failed', detail: emailErr }, { status: 502 });
    }

    return NextResponse.json({ ok: true, sentTo: order.customerEmail });
  } catch (err) {
    console.error('[notify]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
