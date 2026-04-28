import { NextResponse } from 'next/server';
import { getPublicHiddenProductSlugs } from '@/lib/public-catalog';

/** Public: slugs with `product_settings.isActive = 0` (hidden from public catalog UIs). */
export async function GET() {
  const hidden = await getPublicHiddenProductSlugs();
  return NextResponse.json(
    { slugs: Array.from(hidden) },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
