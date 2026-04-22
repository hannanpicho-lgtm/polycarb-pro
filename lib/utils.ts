import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
