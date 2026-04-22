import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifyDistSessionCookie, DIST_COOKIE, applyTierDiscount, type DiscountTier } from '@/lib/distributor-auth';
import { getProductPrice, convertPrice, type Currency } from '@/lib/pricing';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(DIST_COOKIE)?.value;
  if (!cookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const email = await verifyDistSessionCookie(cookie);
  if (!email) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  const profile = await db.prepare(
    `SELECT companyName, discountTier, status FROM distributor_submissions WHERE email = ? ORDER BY createdAt DESC LIMIT 1`
  ).bind(email).first<{ companyName: string; discountTier: string; status: string }>();

  if (!profile || profile.status !== 'approved') {
    return NextResponse.json({ error: 'Only approved distributors can submit quotes' }, { status: 403 });
  }

  const tier = profile.discountTier as DiscountTier;
  const body = await request.json() as {
    currency?: string;
    endCustomerName?: string;
    endCustomerCompany?: string;
    endCustomerCountry?: string;
    shippingRegion?: string;
    message?: string;
    items: Array<{ productSlug: string; qty: number }>;
  };

  if (!body.items?.length) return NextResponse.json({ error: 'No items provided' }, { status: 400 });

  const currency = (body.currency ?? 'USD') as Currency;

  const products = body.items.map(item => {
    const priceInfo = getProductPrice(item.productSlug);
    const listPriceUSD = priceInfo?.unitPriceUSD ?? 0;
    const netPriceUSD = applyTierDiscount(listPriceUSD, tier);
    return {
      productSlug: item.productSlug,
      productName: priceInfo?.name ?? item.productSlug,
      qty: item.qty,
      unit: priceInfo?.unit ?? 'kg',
      unitPriceList: convertPrice(listPriceUSD, currency),
      unitPriceNet: convertPrice(netPriceUSD, currency),
      lineTotal: convertPrice(netPriceUSD * item.qty, currency),
    };
  });

  const subtotalList = products.reduce((s, p) => s + p.unitPriceList * p.qty, 0);
  const subtotalNet = products.reduce((s, p) => s + p.lineTotal, 0);

  const id = crypto.randomUUID();
  const referenceId = `DQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO distributor_quotes
     (id, referenceId, distributorEmail, distributorCompany, discountTier, currency,
      endCustomerName, endCustomerCompany, endCustomerCountry, products,
      subtotalList, subtotalNet, shippingRegion, message, status, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?)`
  ).bind(id, referenceId, email, profile.companyName, tier, currency,
    body.endCustomerName ?? null, body.endCustomerCompany ?? null, body.endCustomerCountry ?? null,
    JSON.stringify(products), subtotalList, subtotalNet,
    body.shippingRegion ?? null, body.message ?? null, now, now).run();

  return NextResponse.json({ ok: true, id, referenceId, subtotalNet }, { status: 201 });
}
