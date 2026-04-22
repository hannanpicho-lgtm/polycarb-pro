'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CompareAwareLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
  'aria-label'?: string;
}

export function CompareAwareLink({ href, className, children, title, 'aria-label': ariaLabel }: CompareAwareLinkProps) {
  const searchParams = useSearchParams();
  const compareSlugs = [searchParams.get('ca'), searchParams.get('cb'), searchParams.get('cc')].filter(
    Boolean
  ) as string[];

  const nextParams = new URLSearchParams();
  compareSlugs.slice(0, 3).forEach((slug, i) => nextParams.set((['ca', 'cb', 'cc'] as const)[i]!, slug));

  const query = nextParams.toString();
  const nextHref = query ? `${href}${href.includes('?') ? '&' : '?'}${query}` : href;

  return (
    <Link href={nextHref} className={className} title={title} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}