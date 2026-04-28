/**
 * GET /api/portal/quotes
 * Returns all quotes for the authenticated customer (matched by email from session).
 * Protected by middleware — requires valid portal session cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { getPortalSessionEmail } from '@/lib/portal-auth';

export async function GET(request: NextRequest) {
  try {
    const email = await getPortalSessionEmail(request);
    if (!email) return apiJsonError('Not authenticated', 401);

    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

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
        id: string;
        referenceId: string;
        customerName: string;
        customerCompany?: string;
        currency: string;
        status: string;
        quotedAmount?: number;
        adminNotes?: string;
        respondedAt?: string;
        expiresAt?: string;
        products: string;
        source: string;
        submittedAt: string;
        createdAt: string;
        updatedAt: string;
      }>();

    const quotes = (results ?? []).map((q) => ({
      ...q,
      products: (() => {
        try {
          return JSON.parse(q.products);
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('GET /api/portal/quotes:', error);
    return apiJsonError('Failed to load quotes', 500);
  }
}
