/**
 * POST /api/portal/quotes/accept
 * Customer accepts or declines a quoted price.
 * Body: { quoteId, action: 'accept' | 'decline' }
 *
 * On accept:
 *  - Quote status → 'accepted'
 *  - Order is auto-created (status: 'confirmed', paymentStatus: 'unpaid')
 *  - Confirmation emails sent to both customer and admin
 *
 * On decline:
 *  - Quote status → 'rejected'
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifySessionCookie, PORTAL_COOKIE } from '@/lib/portal-auth';
import { sendQuoteAcceptedEmails } from '@/lib/email';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(PORTAL_COOKIE)?.value;
    const email = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { quoteId, action } = await request.json() as { quoteId: string; action: 'accept' | 'decline' };
    if (!quoteId || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'quoteId and action (accept|decline) required' }, { status: 400 });
    }

    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    // Load and verify ownership
    const quote = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerEmail, customerCompany,
                currency, quotedAmount, status
         FROM quotes WHERE id = ? AND customerEmail = ?`
      )
      .bind(quoteId, email)
      .first<{
        id: string; referenceId: string; customerName: string;
        customerEmail: string; customerCompany?: string;
        currency: string; quotedAmount?: number; status: string;
      }>();

    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    if (!['quoted', 'pending', 'reviewed'].includes(quote.status)) {
      return NextResponse.json({ error: `Cannot ${action} a quote with status "${quote.status}"` }, { status: 422 });
    }

    const now = new Date().toISOString();

    // ── Decline ─────────────────────────────────────────────────────────────
    if (action === 'decline') {
      await db
        .prepare(`UPDATE quotes SET status = 'rejected', updatedAt = ? WHERE id = ?`)
        .bind(now, quoteId)
        .run();
      return NextResponse.json({ ok: true, action: 'declined' });
    }

    // ── Accept ──────────────────────────────────────────────────────────────
    if (!quote.quotedAmount || quote.quotedAmount <= 0) {
      return NextResponse.json({ error: 'Quote has no priced amount yet — cannot accept' }, { status: 422 });
    }

    // Create order
    const orderId = crypto.randomUUID();
    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await db
      .prepare(
        `INSERT INTO orders
           (id, referenceId, customerName, customerEmail, customerCompany,
            quoteId, currency, status, paymentStatus,
            subtotal, shippingCost, total, confirmedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'unpaid', ?, 0, ?, ?, ?, ?)`
      )
      .bind(
        orderId, orderRef,
        quote.customerName, quote.customerEmail, quote.customerCompany ?? null,
        quote.id, quote.currency,
        quote.quotedAmount, quote.quotedAmount, // subtotal = total (shipping added manually)
        now, now, now
      )
      .run();

    // Update quote status
    await db
      .prepare(`UPDATE quotes SET status = 'accepted', convertedToOrderId = ?, updatedAt = ? WHERE id = ?`)
      .bind(orderId, now, quoteId)
      .run();

    // Send confirmation emails (best-effort)
    await sendQuoteAcceptedEmails({
      customerEmail: quote.customerEmail,
      customerName: quote.customerName,
      referenceId: quote.referenceId,
      orderReferenceId: orderRef,
      quotedAmount: quote.quotedAmount,
      currency: quote.currency,
    }).catch((e) => console.error('[accept quote] email error:', e));

    return NextResponse.json({ ok: true, action: 'accepted', orderReferenceId: orderRef, orderId });
  } catch (error) {
    console.error('POST /api/portal/quotes/accept:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
