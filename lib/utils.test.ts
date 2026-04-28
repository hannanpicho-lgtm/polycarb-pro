import { describe, expect, it } from 'vitest';
import {
  cn,
  formatPrice,
  getCatalogueLinkProps,
  isExternalUrl,
  slugify,
  stripHiddenCompareParamsFromPath,
  truncate,
} from './utils';

describe('cn', () => {
  it('merges and deduplicates with tailwind-merge', () => {
    expect(cn('p-1', 'p-2')).toBe('p-2');
    expect(cn('block', 'hidden')).toBe('hidden');
  });
});

describe('formatPrice', () => {
  it('defaults to en-US USD', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(1.5)).toBe('$1.50');
  });

  it('uses the given currency code', () => {
    expect(formatPrice(20, 'EUR')).toBe('€20.00');
  });
});

describe('slugify', () => {
  it('lowercases, replaces runs of non-alnum with a single dash, and trims edge dashes', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  a---b  ')).toBe('a-b');
  });

  it('returns empty for non-alphanumeric input', () => {
    expect(slugify('---')).toBe('');
  });
});

describe('truncate', () => {
  it('appends an ellipsis when longer than the limit', () => {
    expect(truncate('0123456789X', 5)).toBe('01234…');
  });

  it('returns the string as-is when within the limit', () => {
    expect(truncate('short', 10)).toBe('short');
  });
});

describe('isExternalUrl', () => {
  it('treats http and https as external', () => {
    expect(isExternalUrl('https://example.com/a')).toBe(true);
    expect(isExternalUrl('http://example.com/a')).toBe(true);
  });

  it('treats relative and scheme-relative as not external', () => {
    expect(isExternalUrl('/datasheets/x.pdf')).toBe(false);
    expect(isExternalUrl('//cdn.example.com/x')).toBe(false);
  });
});

describe('getCatalogueLinkProps', () => {
  it('uses target blank for http(s) URLs', () => {
    expect(getCatalogueLinkProps('https://x.com/p.pdf')).toEqual({
      href: 'https://x.com/p.pdf',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('uses download for local or relative paths', () => {
    expect(getCatalogueLinkProps('/datasheets/x.pdf')).toEqual({
      href: '/datasheets/x.pdf',
      download: true,
    });
  });
});

describe('stripHiddenCompareParamsFromPath', () => {
  it('returns paths that do not start with / unchanged', () => {
    expect(stripHiddenCompareParamsFromPath('products?a=x', new Set(['x']))).toBe('products?a=x');
  });

  it('removes compare slugs a/b/c when the value is in the hidden set', () => {
    const hidden = new Set(['gone']);
    expect(stripHiddenCompareParamsFromPath('/products/compare?a=gone&b=keep', hidden)).toBe(
      '/products/compare?b=keep'
    );
  });

  it('removes catalog shortlist keys ca/cb/cc when the value is hidden', () => {
    const hidden = new Set(['h1', 'h2']);
    expect(stripHiddenCompareParamsFromPath('/products?ca=h1&other=1', hidden)).toBe(
      '/products?other=1'
    );
  });

  it('keeps params whose slug value is not hidden', () => {
    const hidden = new Set(['x']);
    expect(stripHiddenCompareParamsFromPath('/p?a=ok', hidden)).toBe('/p?a=ok');
  });

  it('drops the query when no params remain', () => {
    const hidden = new Set(['only']);
    expect(stripHiddenCompareParamsFromPath('/p?a=only', hidden)).toBe('/p');
  });

  it('returns the path unchanged if URL construction throws', () => {
    const Orig = globalThis.URL;
    (globalThis as { URL: unknown }).URL = class {
      constructor() {
        throw new TypeError('invalid url');
      }
    } as unknown as typeof URL;
    try {
      expect(stripHiddenCompareParamsFromPath('/x?a=b&c=d', new Set(['x']))).toBe('/x?a=b&c=d');
    } finally {
      (globalThis as { URL: typeof URL }).URL = Orig;
    }
  });
});
