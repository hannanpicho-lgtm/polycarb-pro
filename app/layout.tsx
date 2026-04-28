import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { DistributorPromoProvider } from '@/components/distributor-promo-provider';
import { OrganizationJsonLd } from '@/components/json-ld';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const SITE_URL = siteConfig.site.url;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: `%s | ${siteConfig.company.shortName}`,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: siteConfig.seo.keywords,
  openGraph: {
    type: 'website',
    locale: siteConfig.site.locale,
    url: SITE_URL,
    siteName: siteConfig.company.name,
    title: siteConfig.seo.defaultTitle,
    description:
      'World-class polycarbonate materials for demanding industrial applications. Request a quote or download technical datasheets.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.company.name} – ${siteConfig.company.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.defaultTitle,
    description: 'World-class polycarbonate materials for demanding industrial applications.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0087C3' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Root layout intentionally has NO Navbar or Footer.
// Public pages live in app/(public)/layout.tsx which adds them.
// Admin / portal / distributor / print routes get their own shells.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DistributorPromoProvider>{children}</DistributorPromoProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
