import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Product } from './data';
import { getFeaturedProducts, getProductBySlug, products } from './data';
import { getD1Safe } from './d1';
import { PUBLIC_COMPARE_MAX_SLUGS } from './public-catalog-constants';

/**
 * `product_settings` rows with `isActive = 0` are hidden on the public marketing site
 * (listings, PDP, compare). No D1 row means the static catalog still applies.
 * On D1 failure, fail open (empty set), consistent with `getProductPriceLive`.
 */
export const getPublicHiddenProductSlugs = cache(async (): Promise<Set<string>> => {
  const db = await getD1Safe();
  if (!db) return new Set();
  try {
    const { results } = await db
      .prepare('SELECT slug FROM product_settings WHERE isActive = 0')
      .all<{ slug: string }>();
    return new Set((results ?? []).map((r) => r.slug));
  } catch {
    return new Set();
  }
});

export {
  COMPARE_QUERY_PARAM_KEYS,
  PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS,
  PUBLIC_COMPARE_MAX_SLUGS,
} from './public-catalog-constants';

export function filterByPublicProductVisibility<T extends { slug: string }>(
  items: T[],
  hidden: Set<string>
): T[] {
  return items.filter((p) => !hidden.has(p.slug));
}

/**
 * Up to `limit` products for homepage cards: prefer default featured order, then full catalog, excluding D1-inactive.
 */
export function pickPublicFeaturedProducts(
  hidden: Set<string>,
  limit: number = PUBLIC_COMPARE_MAX_SLUGS
): Product[] {
  const out: Product[] = [];
  const seen = new Set<string>();
  for (const p of getFeaturedProducts()) {
    if (hidden.has(p.slug) || seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
  }
  for (const p of products) {
    if (out.length >= limit) break;
    if (hidden.has(p.slug) || seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
  }
  return out.slice(0, limit);
}

export async function getHomepagePublicFeaturedProducts(
  limit: number = PUBLIC_COMPARE_MAX_SLUGS
): Promise<Product[]> {
  const hidden = await getPublicHiddenProductSlugs();
  return pickPublicFeaturedProducts(hidden, limit);
}

/** PDP + metadata: 404 for explicitly inactive public SKUs; returns hidden set for related-product filtering. */
export async function notFoundIfProductHiddenInPublicCatalog(slug: string): Promise<Set<string>> {
  const hidden = await getPublicHiddenProductSlugs();
  if (hidden.has(slug)) notFound();
  return hidden;
}

/**
 * Filters compare CSV + ` | `-joined names in lockstep (contact/quote prefill, server actions).
 * Optional `maxSlugs` caps after D1 filtering (e.g. 3 for public compare UI).
 */
export function getSanitizedCompareLeadSlugs(
  hidden: Set<string>,
  compareSlugsCsv: string | undefined,
  compareNamesJoin: string | undefined,
  maxSlugs?: number
): {
  slugs: string[];
  compareSlugsField: string | undefined;
  compareNamesField: string | undefined;
} {
  if (!compareSlugsCsv?.trim()) {
    return { slugs: [], compareSlugsField: undefined, compareNamesField: undefined };
  }
  const slugsRaw = compareSlugsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const namesArr = compareNamesJoin?.split(' | ').map((s) => s.trim()) ?? [];
  const slugs: string[] = [];
  const names: string[] = [];
  for (let i = 0; i < slugsRaw.length; i++) {
    const s = slugsRaw[i]!;
    if (hidden.has(s)) continue;
    slugs.push(s);
    names.push(namesArr[i] ?? s);
    if (maxSlugs !== undefined && slugs.length >= maxSlugs) break;
  }
  if (slugs.length === 0) {
    return { slugs: [], compareSlugsField: undefined, compareNamesField: undefined };
  }
  return {
    slugs,
    compareSlugsField: slugs.join(','),
    compareNamesField: names.join(' | '),
  };
}

/**
 * Resolves `product` and `compare` (comma-separated slugs) for contact/quote prefill, excluding
 * D1-inactive SKUs so subject lines, `sourcePath`, and CRM hidden context match the public catalog.
 * Uses the same compare parsing as `getSanitizedCompareLeadSlugs` (see `PUBLIC_COMPARE_MAX_SLUGS`).
 */
export async function resolvePublicLeadProductContext(input: {
  productSlug: string | undefined;
  compareCsv: string | undefined;
}): Promise<{ product: Product | undefined; compareProducts: Product[] }> {
  const hidden = await getPublicHiddenProductSlugs();
  const raw = input.productSlug ? getProductBySlug(input.productSlug) : undefined;
  const product = raw && !hidden.has(raw.slug) ? raw : undefined;
  const san = getSanitizedCompareLeadSlugs(
    hidden,
    input.compareCsv,
    undefined,
    PUBLIC_COMPARE_MAX_SLUGS
  );
  const compareProducts = san.slugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => p !== undefined);
  return { product, compareProducts };
}
