import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const paymentStatus = url.searchParams.get('paymentStatus') || '';
    const search = url.searchParams.get('search') || '';
    const id = url.searchParams.get('id') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (id) {
      const order = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
      const items = await db.prepare('SELECT * FROM order_items WHERE orderId = ?').bind(id).all();
      return NextResponse.json({ order, items: items.results ?? [] });
    }

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) { conditions.push('status = ?'); params.push(status); }
    if (paymentStatus) { conditions.push('paymentStatus = ?'); params.push(paymentStatus); }
    if (search) {
      conditions.push('(customerEmail LIKE ? OR customerName LIKE ? OR referenceId LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.prepare(
      `SELECT * FROM orders ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    const countResult = await db.prepare(
      `SELECT COUNT(*) as count FROM orders ${where}`
    ).bind(...params).all();

    return NextResponse.json({
      orders: result.results ?? [],
      total: (countResult.results?.[0] as Record<string, unknown>)?.count ?? 0,
    });
  } catch (error) {
    console.error('GET /api/admin/orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const body = await request.json();
    const {
      customerName, customerEmail, customerCompany, customerId,
      quoteId, currency, items, shippingRegion, shippingCost,
      shippingAddress, adminNotes,
    } = body;

    if (!customerName || !customerEmail || !items?.length) {
      return NextResponse.json({ error: 'customerName, customerEmail and items required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const referenceId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    const subtotal: number = items.reduce(
      (sum: number, item: { qty: number; unitPrice: number }) => sum + item.qty * item.unitPrice, 0
    );
    const total = subtotal + (shippingCost ?? 0);

    await db.prepare(
      `INSERT INTO orders (id, referenceId, customerId, customerName, customerEmail, customerCompany,
       quoteId, currency, status, paymentStatus, subtotal, shippingCost, total,
       shippingRegion, shippingAddress, adminNotes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, referenceId, customerId ?? null, customerName, customerEmail,
      customerCompany ?? null, quoteId ?? null, currency ?? 'USD',
      subtotal, shippingCost ?? 0, total,
      shippingRegion ?? null, shippingAddress ?? null, adminNotes ?? null, now, now).run();

    for (const item of items as Array<{ productSlug: string; productName: string; qty: number; unitPrice: number; unit?: string; notes?: string }>) {
      const itemId = crypto.randomUUID();
      await db.prepare(
        `INSERT INTO order_items (id, orderId, productSlug, productName, qty, unit, unitPrice, currency, lineTotal, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(itemId, id, item.productSlug, item.productName, item.qty,
        item.unit ?? 'kg', item.unitPrice, currency ?? 'USD',
        item.qty * item.unitPrice, item.notes ?? null).run();
    }

    // If created from a quote, mark quote as converted
    if (quoteId) {
      await db.prepare(
        `UPDATE quotes SET status = 'converted', convertedToOrderId = ?, updatedAt = ? WHERE id = ?`
      ).bind(id, now, quoteId).run();
    }

    return NextResponse.json({ ok: true, id, referenceId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/orders:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const body = await request.json();
    const { id, status, paymentStatus, trackingNumber, adminNotes,
            confirmedAt, shippedAt, deliveredAt } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const now = new Date().toISOString();
    await db.prepare(
      `UPDATE orders SET
        status = COALESCE(?, status),
        paymentStatus = COALESCE(?, paymentStatus),
        trackingNumber = COALESCE(?, trackingNumber),
        adminNotes = COALESCE(?, adminNotes),
        confirmedAt = COALESCE(?, confirmedAt),
        shippedAt = COALESCE(?, shippedAt),
        deliveredAt = COALESCE(?, deliveredAt),
        updatedAt = ?
       WHERE id = ?`
    ).bind(status ?? null, paymentStatus ?? null, trackingNumber ?? null,
      adminNotes ?? null, confirmedAt ?? null, shippedAt ?? null,
      deliveredAt ?? null, now, id).run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/orders:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
