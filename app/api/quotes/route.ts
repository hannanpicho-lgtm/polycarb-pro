/**
 * Public quote submission endpoint — no auth required.
 * Accepts structured quote data from the website quote builder and
 * writes it directly to the D1 quotes table so admin sees it instantly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

interface QuoteItem {
  productSlug: string;
  productName: string;
  qty: number;
  unit: string;
  unitPriceUSD: number;
  lineTotal: number;   // in submitted currency
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      customerName?: string;
      customerEmail?: string;
      customerCompany?: string;
      customerPhone?: string;
      currency?: string;
      shippingRegion?: string;
      items?: QuoteItem[];
      message?: string;
      source?: string;
    };

    const { customerName, customerEmail, customerCompany, customerPhone,
            currency, shippingRegion, items, message, source } = body;

    if (!customerName?.trim() || !customerEmail?.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(customerEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one product is required' }, { status: 400 });
    }

    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

    const id = crypto.randomUUID();
    const referenceId = `QT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    // Build products JSON array for storage
    const productsJSON = JSON.stringify(
      items.map(i => ({
        productSlug: i.productSlug,
        productName: i.productName,
        qty: i.qty,
        unit: i.unit,
        unitPrice: i.unitPriceUSD,
        lineTotal: i.lineTotal,
      }))
    );

    const productSummary = items
      .map(i => `${i.productName} × ${i.qty}${i.unit}`)
      .join(', ');

    const fullMessage = [
      message?.trim() ? `Customer note: ${message.trim()}` : '',
      shippingRegion ? `Shipping region: ${shippingRegion}` : '',
      customerPhone ? `Phone: ${customerPhone}` : '',
      `Products: ${productSummary}`,
    ].filter(Boolean).join('\n');

    await db.prepare(
      `INSERT INTO quotes
         (id, referenceId, customerName, customerEmail, customerCompany,
          currency, products, message, source, status, submittedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
    ).bind(
      id, referenceId, customerName.trim(), customerEmail.trim().toLowerCase(),
      customerCompany?.trim() ?? null,
      currency ?? 'USD',
      productsJSON,
      fullMessage || null,
      source ?? 'web-builder',
      now, now, now
    ).run();

    // Try to send admin notification (best-effort)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@covestroppc.com';
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL ?? 'noreply@covestroppc.com',
            to: adminEmail,
            subject: `New quote request ${referenceId} — ${customerName}`,
            html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="font-size:18px;color:#0f172a;margin:0 0 12px">New Quote Request</h2>
              <table style="width:100%;font-size:13px;border-collapse:collapse">
                <tr><td style="padding:4px 0;color:#64748b;width:130px">Reference</td><td style="font-weight:700">${referenceId}</td></tr>
                <tr><td style="padding:4px 0;color:#64748b">Customer</td><td>${customerName}${customerCompany ? ` · ${customerCompany}` : ''}</td></tr>
                <tr><td style="padding:4px 0;color:#64748b">Email</td><td>${customerEmail}</td></tr>
                <tr><td style="padding:4px 0;color:#64748b">Currency</td><td>${currency ?? 'USD'}</td></tr>
                <tr><td style="padding:4px 0;color:#64748b">Region</td><td>${shippingRegion ?? 'Not specified'}</td></tr>
                <tr><td style="padding:4px 0;color:#64748b">Products</td><td>${productSummary}</td></tr>
              </table>
              ${message ? `<p style="margin-top:12px;font-size:13px;color:#374151;font-style:italic">"${message}"</p>` : ''}
              <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com'}/admin/quotes" style="display:inline-block;margin-top:16px;background:#0087C3;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600">
                View in Admin →
              </a>
            </div>`,
          }),
        });
      }
    } catch {}

    return NextResponse.json({ ok: true, referenceId }, { status: 201 });
  } catch (err) {
    console.error('[/api/quotes] Error:', err);
    return NextResponse.json({ error: 'Failed to submit quote' }, { status: 500 });
  }
}
