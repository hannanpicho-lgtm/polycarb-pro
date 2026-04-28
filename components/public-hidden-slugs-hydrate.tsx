'use client';

import { hydratePublicHiddenSlugsFromCatalogApi } from '@/hooks/usePublicHiddenSlugs';

type Props = { slugs: string[] };

/**
 * Public product RSC pages already have D1 hidden slugs from the server. This runs on the first
 * client pass (only when `window` is defined) so the shared `usePublicHiddenSlugs` store is full
 * before siblings render; otherwise their subscription can start `/api/catalog/hidden-slugs` during
 * the same commit.
 */
export function PublicHiddenSlugsHydrate({ slugs }: Props) {
  if (typeof window !== 'undefined') {
    hydratePublicHiddenSlugsFromCatalogApi(slugs);
  }
  return null;
}
