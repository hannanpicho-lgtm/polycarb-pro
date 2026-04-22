import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { AUD_RATE, getActiveProductCatalog } from '@/lib/pricing';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

/** Public catalog — active products with live D1 pricing. No auth. */
export async function GET() {
  try {
    const db = await getDB();
    const products = await getActiveProductCatalog(db);
    return NextResponse.json(
      { audRate: AUD_RATE, products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    console.error('GET /api/catalog/prices:', e);
    return NextResponse.json({ error: 'Catalog unavailable' }, { status: 500 });
  }
}
