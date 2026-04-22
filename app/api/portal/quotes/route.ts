/**
 * GET /api/portal/quotes
 * Returns all quotes for the authenticated customer (matched by email from session).
 * Protected by middleware — requires valid portal session cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifySessionCookie, PORTAL_COOKIE } from '@/lib/portal-auth';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(PORTAL_COOKIE)?.value;
    const email = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const { results } = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerCompany, currency, status,
                quotedAmount, adminNotes, respondedAt, expiresAt, products,
                source, submittedAt, createdAt, updatedAt
         FROM quotes
         WHERE customerEmail = ?
         ORDER BY createdAt DESC`
      )
      .bind(email)
      .all<{
        id: string; referenceId: string; customerName: string; customerCompany?: string;
        currency: string; status: string; quotedAmount?: number; adminNotes?: string;
        respondedAt?: string; expiresAt?: string; products: string;
        source: string; submittedAt: string; createdAt: string; updatedAt: string;
      }>();

    const quotes = (results ?? []).map((q) => ({
      ...q,
      products: (() => { try { return JSON.parse(q.products); } catch { return []; } })(),
    }));

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('GET /api/portal/quotes:', error);
    return NextResponse.json({ error: 'Failed to load quotes' }, { status: 500 });
  }
}
