import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import {
  verifyDistSessionCookie,
  DIST_COOKIE,
  applyTierDiscount,
  type DiscountTier,
} from '@/lib/distributor-auth';
import { getProductPriceLive, catalogListUnit, type Currency } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(DIST_COOKIE)?.value;
  if (!cookie) return apiJsonError('Not authenticated', 401);
  const email = await verifyDistSessionCookie(cookie);
  if (!email) return apiJsonError('Invalid session', 401);

  const db = await getD1();
  if (!db) return apiJsonError('DB unavailable', 503);

  const profile = await db
    .prepare(
      `SELECT companyName, discountTier, status FROM distributor_submissions WHERE email = ? ORDER BY createdAt DESC LIMIT 1`
    )
    .bind(email)
    .first<{ companyName: string; discountTier: string; status: string }>();

  if (!profile || profile.status !== 'approved') {
    return NextResponse.json(
      { error: 'Only approved distributors can submit quotes' },
      { status: 403 }
    );
  }

  const tier = profile.discountTier as DiscountTier;
  const body = (await request.json()) as {
    currency?: string;
    endCustomerName?: string;
    endCustomerCompany?: string;
    endCustomerCountry?: string;
    shippingRegion?: string;
    message?: string;
    items: Array<{ productSlug: string; qty: number }>;
  };

  if (!body.items?.length) return apiJsonError('No items provided', 400);

  const currency = (body.currency ?? 'USD') as Currency;

  const products: Array<{
    productSlug: string;
    productName: string;
    qty: number;
    unit: string;
    unitPriceList: number;
    unitPriceNet: number;
    lineTotal: number;
  }> = [];

  for (const item of body.items) {
    const priceInfo = await getProductPriceLive(item.productSlug, db);
    if (!priceInfo) {
      return NextResponse.json(
        { error: `Product is not available: ${item.productSlug}` },
        { status: 400 }
      );
    }
    if (item.qty < priceInfo.minQty) {
      return NextResponse.json(
        { error: `Minimum order for ${priceInfo.name} is ${priceInfo.minQty} ${priceInfo.unit}` },
        { status: 400 }
      );
    }
    const listInCur = catalogListUnit(priceInfo, currency);
    const netInCur = applyTierDiscount(listInCur, tier);
    products.push({
      productSlug: item.productSlug,
      productName: priceInfo.name,
      qty: item.qty,
      unit: priceInfo.unit,
      unitPriceList: Math.round(listInCur * 100) / 100,
      unitPriceNet: Math.round(netInCur * 100) / 100,
      lineTotal: Math.round(netInCur * item.qty * 100) / 100,
    });
  }

  const subtotalList = products.reduce((s, p) => s + p.unitPriceList * p.qty, 0);
  const subtotalNet = products.reduce((s, p) => s + p.lineTotal, 0);

  const id = crypto.randomUUID();
  const referenceId = `DQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO distributor_quotes
     (id, referenceId, distributorEmail, distributorCompany, discountTier, currency,
      endCustomerName, endCustomerCompany, endCustomerCountry, products,
      subtotalList, subtotalNet, shippingRegion, message, status, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?)`
    )
    .bind(
      id,
      referenceId,
      email,
      profile.companyName,
      tier,
      currency,
      body.endCustomerName ?? null,
      body.endCustomerCompany ?? null,
      body.endCustomerCountry ?? null,
      JSON.stringify(products),
      subtotalList,
      subtotalNet,
      body.shippingRegion ?? null,
      body.message ?? null,
      now,
      now
    )
    .run();

  return NextResponse.json({ ok: true, id, referenceId, subtotalNet }, { status: 201 });
}
