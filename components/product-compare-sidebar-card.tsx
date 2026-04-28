'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePublicHiddenSlugs } from '@/hooks/usePublicHiddenSlugs';
import {
  COMPARE_QUERY_PARAM_KEYS,
  PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS,
  PUBLIC_COMPARE_MAX_SLUGS,
} from '@/lib/public-catalog-constants';

interface ProductCompareSidebarCardProps {
  productSlug: string;
  productName: string;
  /** When provided (e.g. from RSC), used immediately; otherwise the shared client hidden-slug store. */
  hiddenSlugs?: string[];
}

function buildProductsHref(compareSlugs: string[]) {
  const params = new URLSearchParams();
  compareSlugs
    .slice(0, PUBLIC_COMPARE_MAX_SLUGS)
    .forEach((slug, i) => params.set(PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS[i]!, slug));
  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

function buildCompareHref(compareSlugs: string[]) {
  const params = new URLSearchParams();
  compareSlugs
    .slice(0, PUBLIC_COMPARE_MAX_SLUGS)
    .forEach((slug, i) => params.set(COMPARE_QUERY_PARAM_KEYS[i]!, slug));
  const query = params.toString();
  return query ? `/products/compare?${query}` : '/products/compare';
}

export function ProductCompareSidebarCard({
  productSlug,
  productName,
  hiddenSlugs: hiddenSlugsProp,
}: ProductCompareSidebarCardProps) {
  const searchParams = useSearchParams();
  const hookHidden = usePublicHiddenSlugs();
  const hidden = React.useMemo(() => {
    if (hiddenSlugsProp && hiddenSlugsProp.length > 0) return new Set(hiddenSlugsProp);
    return hookHidden;
  }, [hiddenSlugsProp, hookHidden]);
  const compareSlugs = Array.from(
    new Set(
      PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS.map((k) => searchParams.get(k)).filter(
        Boolean
      ) as string[]
    )
  )
    .filter((s) => !hidden.has(s))
    .slice(0, PUBLIC_COMPARE_MAX_SLUGS);

  const isSelected = compareSlugs.includes(productSlug);
  const canAdd = !isSelected && compareSlugs.length < PUBLIC_COMPARE_MAX_SLUGS;
  const nextCompareSlugs = isSelected
    ? compareSlugs.filter((slug) => slug !== productSlug)
    : canAdd
      ? [...compareSlugs, productSlug]
      : compareSlugs;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5">
      <h3 className="font-bold text-sm text-foreground mb-2">Compare This Grade</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Build a shortlist of up to {PUBLIC_COMPARE_MAX_SLUGS} grades, then launch a side-by-side
        spec review.
      </p>

      {compareSlugs.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {compareSlugs.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground"
            >
              <span className="max-w-[120px] truncate">
                {slug === productSlug ? productName : slug}
              </span>
              {slug === productSlug ? <X className="h-3 w-3 text-muted-foreground" /> : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
          <Link href={buildProductsHref(nextCompareSlugs)}>
            {isSelected ? 'Remove from shortlist' : canAdd ? 'Add to shortlist' : 'Shortlist full'}
          </Link>
        </Button>
        <Link
          href={buildCompareHref(isSelected || canAdd ? nextCompareSlugs : compareSlugs)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Open Compare <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
