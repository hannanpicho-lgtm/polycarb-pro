import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifySessionCookie, PORTAL_COOKIE } from '@/lib/portal-auth';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(PORTAL_COOKIE)?.value;
  if (!cookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const email = await verifySessionCookie(cookie);
  if (!email) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  // Load orders for this email
  const ordersResult = await db.prepare(
    `SELECT id, referenceId, currency, status, paymentStatus, subtotal, shippingCost, total, createdAt, shippedAt, deliveredAt, trackingNumber
     FROM orders WHERE customerEmail = ? ORDER BY createdAt DESC LIMIT 20`
  ).bind(email).all<{
    id: string; referenceId: string; currency: string; status: string; paymentStatus: string;
    subtotal: number; shippingCost: number; total: number; createdAt: string;
    shippedAt: string | null; deliveredAt: string | null; trackingNumber: string | null;
  }>();

  // Load quotes for this email
  const quotesResult = await db.prepare(
    `SELECT id, referenceId, currency, status, products, quotedAmount, createdAt, respondedAt
     FROM quotes WHERE customerEmail = ? ORDER BY createdAt DESC LIMIT 20`
  ).bind(email).all<{
    id: string; referenceId: string; currency: string; status: string;
    products: string; quotedAmount: number | null; createdAt: string; respondedAt: string | null;
  }>();

  // Load customer profile if exists
  const customer = await db.prepare(
    `SELECT firstName, lastName, company, phone, region, currency FROM customers WHERE email = ? LIMIT 1`
  ).bind(email).first();

  return NextResponse.json({
    email,
    customer,
    orders: ordersResult.results ?? [],
    quotes: quotesResult.results ?? [],
  });
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
