/**
 * GET /api/admin/search?q=term&limit=12
 * Admin-only — protected by middleware.
 * Full-text search across orders, quotes, and customers.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET(request: NextRequest) {
  const q     = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '8'), 20);

  if (q.length < 2) {
    return NextResponse.json({ orders: [], quotes: [], customers: [] });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  const like = `%${q}%`;

  const [ordersRaw, quotesRaw, customersRaw] = await Promise.all([
    db.prepare(
      `SELECT id, referenceId, customerName, customerCompany, total, currency, status, paymentStatus, createdAt
       FROM orders
       WHERE referenceId LIKE ? OR customerName LIKE ? OR customerCompany LIKE ? OR customerEmail LIKE ?
       ORDER BY createdAt DESC LIMIT ?`
    ).bind(like, like, like, like, limit).all<{
      id: string; referenceId: string; customerName: string; customerCompany?: string;
      total: number; currency: string; status: string; paymentStatus: string; createdAt: string;
    }>(),

    db.prepare(
      `SELECT id, referenceId, customerName, customerCompany, currency, status, createdAt
       FROM quotes
       WHERE referenceId LIKE ? OR customerName LIKE ? OR customerCompany LIKE ? OR customerEmail LIKE ?
       ORDER BY createdAt DESC LIMIT ?`
    ).bind(like, like, like, like, limit).all<{
      id: string; referenceId: string; customerName: string; customerCompany?: string;
      currency: string; status: string; createdAt: string;
    }>(),

    db.prepare(
      `SELECT id, firstName, lastName, email, company
       FROM customers
       WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR company LIKE ?
       ORDER BY createdAt DESC LIMIT ?`
    ).bind(like, like, like, like, limit).all<{
      id: string; firstName: string; lastName: string; email: string; company?: string;
    }>(),
  ]);

  return NextResponse.json({
    orders:    ordersRaw.results   ?? [],
    quotes:    quotesRaw.results   ?? [],
    customers: customersRaw.results ?? [],
  });
}
