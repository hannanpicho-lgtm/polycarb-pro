import { getPublicSocialProfileUrls, siteConfig } from '@/lib/site-config';

export function OrganizationJsonLd() {
  const sameAs = getPublicSocialProfileUrls();
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.company.name,
    url: siteConfig.site.url,
    logo: `${siteConfig.site.url}/logo.png`,
    description:
      'Leading distributor of premium polycarbonate sheets, rods, resins and specialty compounds for industrial applications worldwide.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.addressLine1,
      addressLocality: siteConfig.contact.city,
      addressRegion: siteConfig.contact.state,
      postalCode: siteConfig.contact.postalCode,
      addressCountry: siteConfig.contact.country,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: siteConfig.contact.phoneHref,
        contactType: 'sales',
        areaServed: 'US',
        availableLanguage: 'English',
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  brand?: string;
  category?: string;
  url: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  brand,
  category,
  url,
}: ProductSchemaProps) {
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    ...(image && { image }),
    ...(brand && { brand: { '@type': 'Brand', name: brand } }),
    ...(category && { category }),
    url: `${siteConfig.site.url}${url}`,
    manufacturer: {
      '@type': 'Organization',
      name: siteConfig.company.name,
    },
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      offerCount: 1,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${siteConfig.site.url}${item.url}`,
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function FAQJsonLd({ items }: { items: Array<{ question: string; answer: string }> }) {
  const mainEntity = items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
