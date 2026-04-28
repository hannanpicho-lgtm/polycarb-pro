import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  COMPARE_QUERY_PARAM_KEYS,
  PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS,
} from '@/lib/public-catalog-constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function getCatalogueLinkProps(url: string): {
  href: string;
  download?: true;
  target?: '_blank';
  rel?: 'noopener noreferrer';
} {
  if (isExternalUrl(url)) {
    return {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return {
    href: url,
    download: true,
  };
}

const COMPARE_AND_CATALOG_SHORTLIST_KEYS = [
  ...COMPARE_QUERY_PARAM_KEYS,
  ...PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS,
] as const;

/** Remove compare / catalog shortlist query params whose values are inactive (D1) product slugs. */
export function stripHiddenCompareParamsFromPath(path: string, hidden: Set<string>): string {
  if (!path.startsWith('/')) return path;
  try {
    const u = new URL(path, 'https://path.local');
    for (const key of COMPARE_AND_CATALOG_SHORTLIST_KEYS) {
      const v = u.searchParams.get(key);
      if (v && hidden.has(v)) u.searchParams.delete(key);
    }
    const q = u.searchParams.toString();
    return u.pathname + (q ? `?${q}` : '');
  } catch {
    return path;
  }
}
