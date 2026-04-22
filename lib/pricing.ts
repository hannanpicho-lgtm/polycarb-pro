// Product pricing (USD default, AUD = USD × AUD_RATE)
// Admin can override per order. Prices are per kg unless noted.

export const AUD_RATE = 1.55; // USD → AUD multiplier (update as needed)

export type Currency = 'USD' | 'AUD';

export interface ProductPrice {
  slug: string;
  name: string;
  unitPriceUSD: number; // per kg
  unit: string;
  minQty: number;       // minimum order quantity (kg)
  leadTimeDays: number; // typical lead time
}

export const productPrices: ProductPrice[] = [
  // ── Sheets ────────────────────────────────────────────────────────────────
  { slug: 'makrolon-2407-solid-sheet',           name: 'Makrolon 2407 Solid Sheet',           unitPriceUSD: 8.50,  unit: 'kg', minQty: 50,  leadTimeDays: 7  },
  { slug: 'lexan-thermoclear-multiwall',          name: 'Lexan Thermoclear Multiwall',          unitPriceUSD: 7.20,  unit: 'kg', minQty: 50,  leadTimeDays: 7  },
  { slug: 'makrolon-2805-solar-control-sheet',    name: 'Makrolon 2805 Solar Control Sheet',    unitPriceUSD: 9.80,  unit: 'kg', minQty: 50,  leadTimeDays: 10 },
  { slug: 'lexan-lx-polycarbonate-sheet',         name: 'Lexan LX Polycarbonate Sheet',         unitPriceUSD: 7.90,  unit: 'kg', minQty: 50,  leadTimeDays: 7  },
  { slug: 'calibre-solid-sheet-natural',          name: 'Calibre Solid Sheet Natural',          unitPriceUSD: 7.50,  unit: 'kg', minQty: 50,  leadTimeDays: 7  },
  { slug: 'panlite-twinwall-sheet',               name: 'Panlite Twinwall Sheet',               unitPriceUSD: 8.10,  unit: 'kg', minQty: 50,  leadTimeDays: 7  },
  { slug: 'iupilon-pc-sheet-architectural',       name: 'Iupilon PC Sheet Architectural',       unitPriceUSD: 8.40,  unit: 'kg', minQty: 50,  leadTimeDays: 10 },
  { slug: 'lupoy-pc-sheet-clear',                 name: 'Lupoy PC Sheet Clear',                 unitPriceUSD: 7.60,  unit: 'kg', minQty: 50,  leadTimeDays: 7  },
  // ── Rods & Profiles ───────────────────────────────────────────────────────
  { slug: 'pc-solid-rod-natural',                 name: 'PC Solid Rod Natural',                 unitPriceUSD: 10.20, unit: 'kg', minQty: 25,  leadTimeDays: 7  },
  { slug: 'pc-extruded-rod-smoke-tinted',         name: 'PC Extruded Rod Smoke Tinted',         unitPriceUSD: 10.80, unit: 'kg', minQty: 25,  leadTimeDays: 7  },
  { slug: 'lexan-rod-acrylic-polycarbonate',      name: 'Lexan Rod Acrylic Polycarbonate',      unitPriceUSD: 11.50, unit: 'kg', minQty: 25,  leadTimeDays: 7  },
  { slug: 'calibre-pc-tube-natural',              name: 'Calibre PC Tube Natural',              unitPriceUSD: 12.00, unit: 'kg', minQty: 25,  leadTimeDays: 10 },
  { slug: 'panlite-rod-medical-grade',            name: 'Panlite Rod Medical Grade',            unitPriceUSD: 15.50, unit: 'kg', minQty: 25,  leadTimeDays: 14 },
  { slug: 'iupilon-rod-heat-resistant',           name: 'Iupilon Rod Heat Resistant',           unitPriceUSD: 13.00, unit: 'kg', minQty: 25,  leadTimeDays: 10 },
  { slug: 'lupoy-rod-transparent',                name: 'Lupoy Rod Transparent',                unitPriceUSD: 10.50, unit: 'kg', minQty: 25,  leadTimeDays: 7  },
  { slug: 'pc-plate-thick-section',               name: 'PC Plate Thick Section',               unitPriceUSD: 11.00, unit: 'kg', minQty: 25,  leadTimeDays: 7  },
  // ── Resins ────────────────────────────────────────────────────────────────
  { slug: 'sabic-lexan-940-resin',                name: 'Sabic Lexan 940 Resin',                unitPriceUSD: 3.80,  unit: 'kg', minQty: 500, leadTimeDays: 14 },
  { slug: 'makrolon-gf30-glass-filled',           name: 'Makrolon GF30 Glass Filled',           unitPriceUSD: 5.20,  unit: 'kg', minQty: 500, leadTimeDays: 14 },
  { slug: 'calibre-ep5030-fr-resin',              name: 'Calibre EP5030 FR Resin',              unitPriceUSD: 5.80,  unit: 'kg', minQty: 500, leadTimeDays: 14 },
  { slug: 'lupoy-gp1000m-general-purpose',        name: 'Lupoy GP1000M General Purpose',        unitPriceUSD: 3.60,  unit: 'kg', minQty: 500, leadTimeDays: 14 },
  { slug: 'lexan-exl-pc-siloxane-copolymer',      name: 'Lexan EXL PC-Siloxane Copolymer',      unitPriceUSD: 6.40,  unit: 'kg', minQty: 500, leadTimeDays: 21 },
  { slug: 'panlite-l1225-medical-grade',          name: 'Panlite L1225 Medical Grade',          unitPriceUSD: 7.20,  unit: 'kg', minQty: 250, leadTimeDays: 21 },
  { slug: 'iupilon-h3000-high-heat',              name: 'Iupilon H3000 High Heat',              unitPriceUSD: 6.80,  unit: 'kg', minQty: 500, leadTimeDays: 21 },
  // ── Specialty ─────────────────────────────────────────────────────────────
  { slug: 'covestro-makrolon-ar1000-antireflective', name: 'Makrolon AR1000 Antireflective',    unitPriceUSD: 14.50, unit: 'kg', minQty: 50,  leadTimeDays: 21 },
  { slug: 'sabic-lexan-fp-food-contact',          name: 'Lexan FP Food Contact',                unitPriceUSD: 12.00, unit: 'kg', minQty: 100, leadTimeDays: 14 },
  { slug: 'trinseo-calibre-2100-transparent',     name: 'Calibre 2100 Transparent',             unitPriceUSD: 9.50,  unit: 'kg', minQty: 100, leadTimeDays: 14 },
  { slug: 'lg-chem-lupoy-fr-flame-retardant',     name: 'Lupoy FR Flame Retardant',             unitPriceUSD: 10.80, unit: 'kg', minQty: 100, leadTimeDays: 14 },
  { slug: 'teijin-panlite-uv-resistant-specialty', name: 'Panlite UV Resistant',                unitPriceUSD: 11.20, unit: 'kg', minQty: 50,  leadTimeDays: 14 },
  { slug: 'mitsubishi-iupilon-fire-rated-specialty', name: 'Iupilon Fire Rated',                unitPriceUSD: 13.50, unit: 'kg', minQty: 50,  leadTimeDays: 21 },
  { slug: 'covestro-makrolon-esd-electrostatic',  name: 'Makrolon ESD Electrostatic',           unitPriceUSD: 16.00, unit: 'kg', minQty: 50,  leadTimeDays: 21 },
  { slug: 'lexan-ballistic-resistant-compound',   name: 'Lexan Ballistic Resistant',            unitPriceUSD: 22.00, unit: 'kg', minQty: 100, leadTimeDays: 28 },
  { slug: 'calibre-automotive-underhood-compound', name: 'Calibre Automotive Underhood',        unitPriceUSD: 8.90,  unit: 'kg', minQty: 500, leadTimeDays: 21 },
  { slug: 'lupoy-impact-modified-specialty',      name: 'Lupoy Impact Modified',                unitPriceUSD: 9.20,  unit: 'kg', minQty: 100, leadTimeDays: 14 },
  { slug: 'makrolon-medical-grade-iso-10993',     name: 'Makrolon Medical Grade ISO 10993',     unitPriceUSD: 18.00, unit: 'kg', minQty: 25,  leadTimeDays: 21 },
  { slug: 'lexan-medical-optical-lens-compound',  name: 'Lexan Medical Optical Lens',           unitPriceUSD: 20.00, unit: 'kg', minQty: 25,  leadTimeDays: 21 },
  { slug: 'calibre-medical-multiuse-devices',     name: 'Calibre Medical Multi-use',            unitPriceUSD: 17.50, unit: 'kg', minQty: 25,  leadTimeDays: 21 },
  { slug: 'panlite-medical-diagnostic-imaging',   name: 'Panlite Medical Diagnostic Imaging',   unitPriceUSD: 19.00, unit: 'kg', minQty: 25,  leadTimeDays: 28 },
  { slug: 'iupilon-medical-fluid-path',           name: 'Iupilon Medical Fluid Path',           unitPriceUSD: 21.00, unit: 'kg', minQty: 25,  leadTimeDays: 28 },
  { slug: 'lupoy-medical-dental-applications',    name: 'Lupoy Medical Dental',                 unitPriceUSD: 19.50, unit: 'kg', minQty: 25,  leadTimeDays: 28 },
  { slug: 'makrolon-medical-sports-prosthetics',  name: 'Makrolon Medical Sports Prosthetics',  unitPriceUSD: 17.00, unit: 'kg', minQty: 25,  leadTimeDays: 21 },
  { slug: 'lexan-medical-surgical-safety-guards', name: 'Lexan Medical Surgical Safety Guards', unitPriceUSD: 16.50, unit: 'kg', minQty: 25,  leadTimeDays: 21 },
];

export const productPriceMap = new Map<string, ProductPrice>(
  productPrices.map((p) => [p.slug, p])
);

export function getProductPrice(slug: string): ProductPrice | undefined {
  return productPriceMap.get(slug);
}

/**
 * Server-only: fetch the live (D1-overridden) price for a product.
 * Falls back to the static pricing.ts entry when D1 has no override.
 * Import this only in Server Components or API routes.
 */
export async function getProductPriceLive(
  slug: string,
  db: import('@cloudflare/workers-types').D1Database | null
): Promise<ProductPrice | undefined> {
  const staticPrice = productPriceMap.get(slug);
  if (!staticPrice) return undefined;
  if (!db) return staticPrice;

  try {
    const row = await db
      .prepare('SELECT * FROM product_settings WHERE slug = ? AND isActive = 1')
      .bind(slug)
      .first<{
        unitPriceUSD: number; unitPriceAUD: number | null;
        unit: string; minQty: number; leadTimeDays: number;
      }>();
    if (!row) return staticPrice;
    return {
      slug,
      name: staticPrice.name,
      unitPriceUSD: row.unitPriceUSD,
      unit: row.unit,
      minQty: row.minQty,
      leadTimeDays: row.leadTimeDays,
    };
  } catch {
    return staticPrice;
  }
}

export function convertPrice(amountUSD: number, currency: Currency): number {
  if (currency === 'AUD') return Math.round(amountUSD * AUD_RATE * 100) / 100;
  return amountUSD;
}

export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Shipping regions ──────────────────────────────────────────────────────────

export interface ShippingRegion {
  id: string;
  label: string;
  currency: Currency;
  rateUSD: number;       // flat rate USD per shipment (base)
  ratePerKgUSD: number;  // per kg surcharge
}

export const shippingRegions: ShippingRegion[] = [
  { id: 'au-domestic',  label: 'Australia (Domestic)',    currency: 'AUD', rateUSD: 120,  ratePerKgUSD: 0.80 },
  { id: 'nz',           label: 'New Zealand',             currency: 'USD', rateUSD: 180,  ratePerKgUSD: 1.20 },
  { id: 'us-canada',    label: 'USA & Canada',            currency: 'USD', rateUSD: 350,  ratePerKgUSD: 1.50 },
  { id: 'uk-europe',    label: 'UK & Europe',             currency: 'USD', rateUSD: 420,  ratePerKgUSD: 1.80 },
  { id: 'sea',          label: 'Southeast Asia',          currency: 'USD', rateUSD: 280,  ratePerKgUSD: 1.20 },
  { id: 'middle-east',  label: 'Middle East',             currency: 'USD', rateUSD: 380,  ratePerKgUSD: 1.60 },
  { id: 'africa',       label: 'Africa',                  currency: 'USD', rateUSD: 480,  ratePerKgUSD: 2.00 },
  { id: 'other',        label: 'Other / TBD',             currency: 'USD', rateUSD: 0,    ratePerKgUSD: 0    },
];

export const shippingRegionMap = new Map<string, ShippingRegion>(
  shippingRegions.map((r) => [r.id, r])
);

export function calcShipping(regionId: string, totalKg: number, currency: Currency): number {
  const region = shippingRegionMap.get(regionId);
  if (!region) return 0;
  const usd = region.rateUSD + region.ratePerKgUSD * totalKg;
  return convertPrice(usd, currency);
}
