import { NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { AUD_RATE, getActiveProductCatalog } from '@/lib/pricing';
import { getPublicHiddenProductSlugs } from '@/lib/public-catalog';

/** Public catalog — active products with live D1 pricing. No auth. */
export async function GET() {
  try {
    const db = await getD1();
    const [products, publicHiddenSlugs] = await Promise.all([
      getActiveProductCatalog(db),
      getPublicHiddenProductSlugs().then((s) => Array.from(s)),
    ]);
    return NextResponse.json(
      { audRate: AUD_RATE, products, publicHiddenSlugs },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    console.error('GET /api/catalog/prices:', e);
    return apiJsonError('Catalog unavailable', 500);
  }
}
