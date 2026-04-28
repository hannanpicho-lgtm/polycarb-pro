/**
 * GET  /api/admin/products          — list all products merged with D1 settings
 * POST /api/admin/products          — seed D1 from static pricing data (idempotent)
 * PATCH /api/admin/products         — update settings for one product
 */
import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { productPrices } from '@/lib/pricing';

interface ProductSettingsRow {
  slug: string;
  unitPriceUSD: number;
  unitPriceAUD: number | null;
  unit: string;
  minQty: number;
  leadTimeDays: number;
  isActive: number;
  featured: number;
  sortOrder: number;
  adminNotes: string | null;
  updatedAt: string;
}

// ── GET: merged list ─────────────────────────────────────────────────────────
export async function GET() {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const { results } = await db
      .prepare('SELECT * FROM product_settings ORDER BY sortOrder ASC, slug ASC')
      .all<ProductSettingsRow>();

    const settingsMap = new Map<string, ProductSettingsRow>(
      (results ?? []).map((r) => [r.slug, r])
    );

    // Merge static product list with D1 overrides (or defaults from pricing.ts)
    const merged = productPrices.map((p, i) => {
      const override = settingsMap.get(p.slug);
      return {
        slug: p.slug,
        name: p.name,
        unitPriceUSD: override?.unitPriceUSD ?? p.unitPriceUSD,
        unitPriceAUD: override?.unitPriceAUD ?? null,
        unit: override?.unit ?? p.unit,
        minQty: override?.minQty ?? p.minQty,
        leadTimeDays: override?.leadTimeDays ?? p.leadTimeDays,
        isActive: override ? Boolean(override.isActive) : true,
        featured: override ? Boolean(override.featured) : false,
        sortOrder: override?.sortOrder ?? i,
        adminNotes: override?.adminNotes ?? null,
        updatedAt: override?.updatedAt ?? null,
        inDB: !!override,
      };
    });

    return NextResponse.json({ products: merged, total: merged.length });
  } catch (error) {
    console.error('GET /api/admin/products:', error);
    return apiJsonError('Failed to load products', 500);
  }
}

// ── POST: seed all products into D1 (idempotent — skips existing rows) ───────
export async function POST() {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const now = new Date().toISOString();
    let seeded = 0;

    for (let i = 0; i < productPrices.length; i++) {
      const p = productPrices[i];
      if (!p) continue;
      const result = await db
        .prepare(
          `INSERT INTO product_settings (slug, unitPriceUSD, unit, minQty, leadTimeDays, isActive, featured, sortOrder, updatedAt)
           VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)
           ON CONFLICT(slug) DO NOTHING`
        )
        .bind(p.slug, p.unitPriceUSD, p.unit, p.minQty, p.leadTimeDays, i, now)
        .run();
      if (result.meta.changes > 0) seeded++;
    }

    return NextResponse.json({ ok: true, seeded, total: productPrices.length });
  } catch (error) {
    console.error('POST /api/admin/products (seed):', error);
    return apiJsonError('Seed failed', 500);
  }
}

// ── PATCH: update product settings ──────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const body = (await request.json()) as {
      slug: string;
      unitPriceUSD?: number;
      unitPriceAUD?: number | null;
      unit?: string;
      minQty?: number;
      leadTimeDays?: number;
      isActive?: boolean;
      featured?: boolean;
      sortOrder?: number;
      adminNotes?: string | null;
    };

    if (!body.slug) {
      return apiJsonError('slug required', 400);
    }

    // Find defaults from static data
    const staticPrice = productPrices.find((p) => p.slug === body.slug);
    if (!staticPrice) {
      return apiJsonError('Unknown product slug', 404);
    }

    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO product_settings (slug, unitPriceUSD, unitPriceAUD, unit, minQty, leadTimeDays, isActive, featured, sortOrder, adminNotes, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           unitPriceUSD  = COALESCE(excluded.unitPriceUSD,  unitPriceUSD),
           unitPriceAUD  = excluded.unitPriceAUD,
           unit          = COALESCE(excluded.unit,          unit),
           minQty        = COALESCE(excluded.minQty,        minQty),
           leadTimeDays  = COALESCE(excluded.leadTimeDays,  leadTimeDays),
           isActive      = COALESCE(excluded.isActive,      isActive),
           featured      = COALESCE(excluded.featured,      featured),
           sortOrder     = COALESCE(excluded.sortOrder,     sortOrder),
           adminNotes    = excluded.adminNotes,
           updatedAt     = excluded.updatedAt`
      )
      .bind(
        body.slug,
        body.unitPriceUSD ?? staticPrice.unitPriceUSD,
        body.unitPriceAUD ?? null,
        body.unit ?? staticPrice.unit,
        body.minQty ?? staticPrice.minQty,
        body.leadTimeDays ?? staticPrice.leadTimeDays,
        body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1,
        body.featured !== undefined ? (body.featured ? 1 : 0) : 0,
        body.sortOrder ?? 0,
        body.adminNotes ?? null,
        now
      )
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/products:', error);
    return apiJsonError('Update failed', 500);
  }
}
