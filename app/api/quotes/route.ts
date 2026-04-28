/**
 * Public quote submission endpoint — no auth required.
 * Accepts structured quote data from the website quote builder and
 * writes it directly to the D1 quotes table so admin sees it instantly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { sendQuoteSubmittedConfirmation, sendNewQuoteAdminAlert } from '@/lib/email';
import { catalogListUnit, getProductPriceLive, type Currency } from '@/lib/pricing';

interface QuoteItem {
  productSlug: string;
  productName: string;
  qty: number;
  unit: string;
  unitPriceUSD: number;
  lineTotal: number; // in submitted currency
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
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

    const {
      customerName,
      customerEmail,
      customerCompany,
      customerPhone,
      currency,
      shippingRegion,
      items,
      message,
      source,
    } = body;

    if (!customerName?.trim() || !customerEmail?.trim()) {
      return apiJsonError('Name and email are required', 400);
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(customerEmail)) {
      return apiJsonError('Invalid email address', 400);
    }

    if (!items || items.length === 0) {
      return apiJsonError('At least one product is required', 400);
    }

    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const cur = (currency === 'AUD' ? 'AUD' : 'USD') as Currency;

    // Re-check prices server-side (ignore client-reported $ — prevents tampering; respects D1 admin overrides)
    const verified: QuoteItem[] = [];
    for (const i of items) {
      if (!i.productSlug || typeof i.qty !== 'number' || i.qty <= 0) {
        return NextResponse.json(
          { error: 'Each line must include a product and positive quantity' },
          { status: 400 }
        );
      }
      const live = await getProductPriceLive(i.productSlug, db);
      if (!live) {
        return NextResponse.json(
          { error: `Product is not available: ${i.productSlug}` },
          { status: 400 }
        );
      }
      if (i.qty < live.minQty) {
        return NextResponse.json(
          { error: `Minimum order for ${live.name} is ${live.minQty} ${live.unit}` },
          { status: 400 }
        );
      }
      const unitInCur = catalogListUnit(live, cur);
      verified.push({
        productSlug: i.productSlug,
        productName: live.name,
        qty: i.qty,
        unit: live.unit,
        unitPriceUSD: live.unitPriceUSD,
        lineTotal: Math.round(unitInCur * i.qty * 100) / 100,
      });
    }

    const id = crypto.randomUUID();
    const referenceId = `QT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    // Build products JSON array for storage
    const productsJSON = JSON.stringify(
      verified.map((i) => ({
        productSlug: i.productSlug,
        productName: i.productName,
        qty: i.qty,
        unit: i.unit,
        unitPrice: i.unitPriceUSD,
        lineTotal: i.lineTotal,
        currency: cur,
      }))
    );

    const productSummary = verified.map((i) => `${i.productName} × ${i.qty}${i.unit}`).join(', ');

    const fullMessage = [
      message?.trim() ? `Customer note: ${message.trim()}` : '',
      shippingRegion ? `Shipping region: ${shippingRegion}` : '',
      customerPhone ? `Phone: ${customerPhone}` : '',
      `Products: ${productSummary}`,
    ]
      .filter(Boolean)
      .join('\n');

    await db
      .prepare(
        `INSERT INTO quotes
         (id, referenceId, customerName, customerEmail, customerCompany,
          currency, products, message, source, status, submittedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
      )
      .bind(
        id,
        referenceId,
        customerName.trim(),
        customerEmail.trim().toLowerCase(),
        customerCompany?.trim() ?? null,
        cur,
        productsJSON,
        fullMessage || null,
        source ?? 'web-builder',
        now,
        now,
        now
      )
      .run();

    // Fire confirmation + admin alert in parallel (best-effort — never block the 201)
    await Promise.allSettled([
      sendQuoteSubmittedConfirmation({
        to: customerEmail.trim().toLowerCase(),
        name: customerName.trim(),
        referenceId,
        products: verified.map((i) => ({ name: i.productName, qty: i.qty, unit: i.unit })),
      }),
      sendNewQuoteAdminAlert({
        referenceId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerCompany: customerCompany?.trim(),
        products: verified.map((i) => ({ name: i.productName, qty: i.qty, unit: i.unit })),
        message: message?.trim(),
      }),
    ]);

    return NextResponse.json({ ok: true, referenceId }, { status: 201 });
  } catch (err) {
    console.error('[/api/quotes] Error:', err);
    return apiJsonError('Failed to submit quote', 500);
  }
}
