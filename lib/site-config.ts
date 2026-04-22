export const siteConfig = {
  company: {
    name: 'Covestro PC',
    shortName: 'Covestro PC',
    legalName: 'Covestro PC Materials LLC',
    tagline: 'Premium Polycarbonate Solutions',
    foundedYear: 2003,
  },
  contact: {
    salesEmail: 'sales@polycarbpro.com',
    phoneDisplay: '+1 (713) 555-0172',
    phoneHref: '+17135550172',
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
    facebook: 'https://www.facebook.com/profile.php?id=61569095061401',
    instagram: 'https://www.instagram.com/polycarbonatepanels?igsh=NXlybGZxaGFhc2s0',
    telegram: 'https://t.me/POLYCARBONATEPANELS',
    tiktok: 'https://tiktok.com/@polycarbonatepane',
        linkedin: '', // TODO: Add LinkedIn page URL
    youtube: '', // TODO: Add YouTube channel URL
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
