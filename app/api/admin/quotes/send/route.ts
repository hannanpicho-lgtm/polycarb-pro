/**
 * POST /api/admin/quotes/send
 * Admin sends a priced quote to the customer.
 * Body: { quoteId, quotedAmount, currency?, adminMessage?, expiresInDays? }
 * - Updates quote status to "quoted"
 * - Sends branded email to the customer with pricing + portal link
 */
import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { sendQuoteToCustomer } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      quoteId: string;
      quotedAmount: number;
      currency?: string;
      adminMessage?: string;
      expiresInDays?: number;
    };

    const { quoteId, quotedAmount, currency, adminMessage, expiresInDays } = body;
    if (!quoteId || !quotedAmount || quotedAmount <= 0) {
      return apiJsonError('quoteId and quotedAmount are required', 400);
    }

    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const quote = await db
      .prepare(
        'SELECT id, referenceId, customerName, customerEmail, customerCompany, currency FROM quotes WHERE id = ?'
      )
      .bind(quoteId)
      .first<{
        id: string;
        referenceId: string;
        customerName: string;
        customerEmail: string;
        customerCompany?: string;
        currency: string;
      }>();

    if (!quote) return apiJsonError('Quote not found', 404);
    if (!quote.customerEmail) return apiJsonError('No email on this quote', 422);

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
    return apiJsonError('Failed to send quote', 500);
  }
}
