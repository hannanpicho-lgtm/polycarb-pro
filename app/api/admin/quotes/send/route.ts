/**
 * POST /api/admin/quotes/send
 * Admin sends a priced quote to the customer.
 * Body: { quoteId, quotedAmount, currency?, adminMessage?, expiresInDays? }
 * - Updates quote status to "quoted"
 * - Sends branded email to the customer with pricing + portal link
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { sendQuoteToCustomer } from '@/lib/email';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      quoteId: string;
      quotedAmount: number;
      currency?: string;
      adminMessage?: string;
      expiresInDays?: number;
    };

    const { quoteId, quotedAmount, currency, adminMessage, expiresInDays } = body;
    if (!quoteId || !quotedAmount || quotedAmount <= 0) {
      return NextResponse.json({ error: 'quoteId and quotedAmount are required' }, { status: 400 });
    }

    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const quote = await db
      .prepare('SELECT id, referenceId, customerName, customerEmail, customerCompany, currency FROM quotes WHERE id = ?')
      .bind(quoteId)
      .first<{
        id: string; referenceId: string;
        customerName: string; customerEmail: string; customerCompany?: string;
        currency: string;
      }>();

    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    if (!quote.customerEmail) return NextResponse.json({ error: 'No email on this quote' }, { status: 422 });

    const now = new Date().toISOString();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // default 14 days

    // Update quote in DB
    await db
      .prepare(
        `UPDATE quotes SET status = 'quoted', quotedAmount = ?, adminNotes = COALESCE(?, adminNotes),
         respondedAt = ?, expiresAt = ?, updatedAt = ? WHERE id = ?`
      )
      .bind(quotedAmount, adminMessage ?? null, now, expiresAt, now, quoteId)
      .run();

    // Send email to customer
    const { ok, error: emailErr } = await sendQuoteToCustomer({
      to: quote.customerEmail,
      name: quote.customerName,
      referenceId: quote.referenceId,
      quotedAmount,
      currency: currency ?? quote.currency ?? 'USD',
      adminMessage: adminMessage ?? undefined,
      expiresAt,
    });

    if (!ok) {
      console.error('[admin/quotes/send] Email error:', emailErr);
      // DB update succeeded; warn but don't fail
      return NextResponse.json({ ok: true, emailSent: false, emailError: emailErr });
    }

    return NextResponse.json({ ok: true, emailSent: true, sentTo: quote.customerEmail });
  } catch (error) {
    console.error('[admin/quotes/send]', error);
    return NextResponse.json({ error: 'Failed to send quote' }, { status: 500 });
  }
}
