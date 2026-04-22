import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://covestro-polycarbonates.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] }],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
