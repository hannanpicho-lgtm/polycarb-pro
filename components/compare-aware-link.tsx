'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePublicHiddenSlugs } from '@/hooks/usePublicHiddenSlugs';
import {
  PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS,
  PUBLIC_COMPARE_MAX_SLUGS,
} from '@/lib/public-catalog-constants';

interface CompareAwareLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
  'aria-label'?: string;
}

export function CompareAwareLink({
  href,
  className,
  children,
  title,
  'aria-label': ariaLabel,
}: CompareAwareLinkProps) {
  const searchParams = useSearchParams();
  const hidden = usePublicHiddenSlugs();
  const compareSlugs = (
    [searchParams.get('ca'), searchParams.get('cb'), searchParams.get('cc')].filter(
      Boolean
    ) as string[]
  ).filter((slug) => !hidden.has(slug));

  const nextParams = new URLSearchParams();
  compareSlugs
    .slice(0, PUBLIC_COMPARE_MAX_SLUGS)
    .forEach((slug, i) => nextParams.set(PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS[i]!, slug));

  const query = nextParams.toString();
  const nextHref = query ? `${href}${href.includes('?') ? '&' : '?'}${query}` : href;

  return (
    <Link href={nextHref} className={className} title={title} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
