/**
 * Client-safe: no D1 / server imports. Use for compare URLs and shortlist bounds
 * so UI matches `lib/public-catalog` + `PUBLIC_COMPARE_MAX_SLUGS` re-export there.
 */
export const PUBLIC_COMPARE_MAX_SLUGS = 3;

/** `/products/compare?` — product slugs */
export const COMPARE_QUERY_PARAM_KEYS = ['a', 'b', 'c'] as const;

/** `/products?` — compare shortlist propagated on the catalog */
export const PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS = ['ca', 'cb', 'cc'] as const;
