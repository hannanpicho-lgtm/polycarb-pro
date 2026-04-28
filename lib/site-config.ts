export const siteConfig = {
  company: {
    name: 'Covestro PC',
    shortName: 'Covestro PC',
    legalName: 'Covestro PC Materials LLC',
    tagline: 'Premium Polycarbonate Solutions',
    foundedYear: 2003,
  },
  contact: {
    salesEmail: process.env['NEXT_PUBLIC_CONTACT_SALES_EMAIL'] ?? 'sales@polycarbpro.com',
    phoneDisplay: process.env['NEXT_PUBLIC_CONTACT_PHONE_DISPLAY'] ?? '+1 (713) 555-0172',
    phoneHref: process.env['NEXT_PUBLIC_CONTACT_PHONE_HREF'] ?? '+17135550172',
    businessHours: 'Mon–Fri 8 AM – 6 PM EST',
    addressLine1: '1800 West Loop South, Suite 1550',
    city: 'Houston',
    state: 'TX',
    postalCode: '77027',
    country: 'USA',
  },
  site: {
    url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://covestro-polycarbonates.com',
    locale: 'en_US',
  },
  social: {
    /** Leave empty to hide the icon in the footer. */
    linkedin: '',
    youtube: '',
    facebook: 'https://www.facebook.com/profile.php?id=61569095061401',
    instagram: 'https://www.instagram.com/polycarbonatepanels?igsh=NXlybGZxaGFhc2s0',
    telegram: 'https://t.me/POLYCARBONATEPANELS',
    tiktok: 'https://tiktok.com/@polycarbonatepane',
    whatsapp: 'https://wa.me/17135550172',
  },
  seo: {
    defaultTitle: 'Covestro PC | Premium Polycarbonate Solutions',
    defaultDescription:
      'Leading distributor of premium polycarbonate sheets, rods, resins and specialty compounds for automotive, construction, medical, and electronics industries.',
    keywords: [
      'polycarbonate',
      'PC sheets',
      'polycarbonate rods',
      'engineering plastics',
      'SABIC Lexan',
      'Covestro Makrolon',
      'flame retardant PC',
      'optical grade polycarbonate',
      'medical grade PC',
      'thermoplastics distributor',
    ],
  },
};

/** Public Google Maps “search” link for the configured office (no API key). */
export function getSiteOfficeGoogleMapsUrl(): string {
  const { addressLine1, city, state, postalCode, country } = siteConfig.contact;
  const q = [addressLine1, city, state, postalCode, country].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Non-empty social profile URLs (for `sameAs` / footer). */
export function getPublicSocialProfileUrls(): string[] {
  return Object.values(siteConfig.social).filter(
    (u): u is string => typeof u === 'string' && u.length > 0
  );
}
