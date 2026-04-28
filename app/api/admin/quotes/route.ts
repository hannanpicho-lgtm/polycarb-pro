import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

export async function GET(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database not available', 503);

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(customerEmail LIKE ? OR customerName LIKE ? OR referenceId LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db
      .prepare(`SELECT * FROM quotes ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
      .bind(...params, limit, offset)
      .all();

    const countResult = await db
      .prepare(`SELECT COUNT(*) as count FROM quotes ${where}`)
      .bind(...params)
      .all();

    return NextResponse.json({
      quotes: result.results ?? [],
      total: (countResult.results?.[0] as Record<string, unknown>)?.count ?? 0,
    });
  } catch (error) {
    console.error('GET /api/admin/quotes:', error);
    return apiJsonError('Failed to fetch quotes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database not available', 503);

    const body = await request.json();
    const { customerName, customerEmail, customerCompany, currency, products, message, source } =
      body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'customerName and customerEmail required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const referenceId = `QT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO quotes (id, referenceId, customerName, customerEmail, customerCompany, currency, products, message, source, status, submittedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
      )
      .bind(
        id,
        referenceId,
        customerName,
        customerEmail,
        customerCompany ?? null,
        currency ?? 'USD',
        JSON.stringify(products ?? []),
        message ?? null,
        source ?? 'web',
        now,
        now,
        now
      )
      .run();

    return NextResponse.json({ ok: true, id, referenceId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/quotes:', error);
    return apiJsonError('Failed to create quote', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database not available', 503);

    const body = await request.json();
    const { id, status, adminNotes, quotedAmount, respondedAt } = body;

    if (!id) return apiJsonError('id required', 400);

    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE quotes SET status = COALESCE(?, status), adminNotes = COALESCE(?, adminNotes),
       quotedAmount = COALESCE(?, quotedAmount), respondedAt = COALESCE(?, respondedAt),
       updatedAt = ? WHERE id = ?`
      )
      .bind(status ?? null, adminNotes ?? null, quotedAmount ?? null, respondedAt ?? null, now, id)
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/quotes:', error);
    return apiJsonError('Failed to update quote', 500);
  }
}
