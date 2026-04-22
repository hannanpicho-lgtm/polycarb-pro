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
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM customers';
    const params: unknown[] = [];
    if (search) {
      query += ' WHERE email LIKE ? OR company LIKE ? OR firstName LIKE ? OR lastName LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await db.prepare(query).bind(...params).all();
    const countResult = await db.prepare(
      search
        ? 'SELECT COUNT(*) as count FROM customers WHERE email LIKE ? OR company LIKE ? OR firstName LIKE ? OR lastName LIKE ?'
        : 'SELECT COUNT(*) as count FROM customers'
    ).bind(...(search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [])).all();

    return NextResponse.json({
      customers: result.results ?? [],
      total: (countResult.results?.[0] as Record<string, unknown>)?.count ?? 0,
    });
  } catch (error) {
    console.error('GET /api/admin/customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const body = await request.json();
    const { firstName, lastName, email, company, phone, region, currency, notes } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'firstName, lastName and email are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO customers (id, firstName, lastName, email, company, phone, region, currency, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, firstName, lastName, email, company ?? null, phone ?? null,
      region ?? 'international', currency ?? 'USD', notes ?? null, now, now).run();

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'A customer with that email already exists' }, { status: 409 });
    }
    console.error('POST /api/admin/customers:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
