import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifyDistSessionCookie, DIST_COOKIE } from '@/lib/distributor-auth';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(DIST_COOKIE)?.value;
  if (!cookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const email = await verifyDistSessionCookie(cookie);
  if (!email) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  const profile = await db.prepare(
    `SELECT id, fullName, companyName, email, phone, businessType, countries,
            estimatedAnnualVolume, jobTitle, status, discountTier,
            approvedAt, internalNotes, createdAt
     FROM distributor_submissions WHERE email = ? ORDER BY createdAt DESC LIMIT 1`
  ).bind(email).first<{
    id: string; fullName: string; companyName: string; email: string;
    phone: string; businessType: string; countries: string;
    estimatedAnnualVolume: string; jobTitle: string; status: string;
    discountTier: string; approvedAt: string | null; createdAt: string;
  }>();

  if (!profile) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

  // Load their submitted distributor quotes
  const quotesResult = await db.prepare(
    `SELECT id, referenceId, currency, status, products, subtotalNet, createdAt, respondedAt
     FROM distributor_quotes WHERE distributorEmail = ? ORDER BY createdAt DESC LIMIT 20`
  ).bind(email).all<{
    id: string; referenceId: string; currency: string; status: string;
    products: string; subtotalNet: number; createdAt: string; respondedAt: string | null;
  }>();

  return NextResponse.json({
    email,
    profile,
    quotes: quotesResult.results ?? [],
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DIST_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
