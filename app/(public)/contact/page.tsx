import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Phone, Mail, MapPin, Clock, MessageSquare, FileText, Users } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { ViewportVideo } from '@/components/viewport-video';
import { siteConfig } from '@/lib/site-config';
import { getProductBySlug } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    `Get in touch with ${siteConfig.company.name} for quotes, technical support, and material consultation. We respond within 1 business day.`,
};

const contactMethods = [
  {
    icon: Phone,
    title: 'Call Sales',
    detail: siteConfig.contact.phoneDisplay,
    sub: siteConfig.contact.businessHours,
    href: `tel:${siteConfig.contact.phoneHref}`,
  },
  {
    icon: Mail,
    title: 'Email Us',
    detail: siteConfig.contact.salesEmail,
    sub: 'Response within 1 business day',
    href: `mailto:${siteConfig.contact.salesEmail}`,
  },
  {
    icon: MapPin,
    title: 'Head Office',
    detail: siteConfig.contact.addressLine1,
    sub: `${siteConfig.contact.city}, ${siteConfig.contact.state} ${siteConfig.contact.postalCode}, ${siteConfig.contact.country}`,
    href: '#',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    detail: siteConfig.contact.businessHours,
    sub: 'Sat–Sun: Closed',
    href: undefined,
  },
];

const enquiryTypes = [
  { icon: MessageSquare, label: 'Request a Quote', desc: 'Get pricing for specific grades and volumes.' },
  { icon: FileText, label: 'Download Datasheets', desc: 'Access full TDS and MSDS documents.' },
  { icon: Users, label: 'Technical Consultation', desc: 'Talk to an applications engineer about your project.' },
];

interface ContactSearchParams {
  product?: string;
  compare?: string;
  onlydiff?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  msclkid?: string;
  fbclid?: string;
  landing_path?: string;
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<ContactSearchParams> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const fromParamOrCookie = (paramValue: string | undefined, cookieName: string) => paramValue ?? cookieStore.get(cookieName)?.value;
  const utmSource = fromParamOrCookie(params.utm_source, 'pc_utm_source');
  const utmMedium = fromParamOrCookie(params.utm_medium, 'pc_utm_medium');
  const utmCampaign = fromParamOrCookie(params.utm_campaign, 'pc_utm_campaign');
  const gclid = fromParamOrCookie(params.gclid, 'pc_gclid');
  const msclkid = fromParamOrCookie(params.msclkid, 'pc_msclkid');
  const fbclid = fromParamOrCookie(params.fbclid, 'pc_fbclid');
  const landingPath = fromParamOrCookie(params.landing_path, 'pc_landing_path');
  const product = params.product ? getProductBySlug(params.product) : undefined;
  const compareProducts = (params.compare ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean)
    .map((slug) => getProductBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
    .slice(0, 3);

  const compareNames = compareProducts.map((item) => item.name);
  const compareSlugs = compareProducts.map((item) => item.slug);
  const sourcePath = compareProducts.length > 0
    ? `/products/compare?${compareProducts
      .map((item, i) => `${(['a', 'b', 'c'] as const)[i]}=${item.slug}`)
      .join('&')}${params.onlydiff === '1' ? '&onlydiff=1' : ''}`
    : product
      ? `/products/${product.slug}`
      : '/contact';
  const hiddenContext = {
    leadSource: params.source ?? (compareProducts.length > 0 ? 'compare-page' : product ? 'product-page' : 'contact-page'),
    compareSlugs: compareSlugs.length > 0 ? compareSlugs.join(',') : undefined,
    compareNames: compareNames.length > 0 ? compareNames.join(' | ') : undefined,
    compareOnlyDiff: compareProducts.length > 0 ? (params.onlydiff === '1' ? '1' : '0') : undefined,
    sourcePath,
    landingPath: landingPath ?? ((gclid || msclkid || fbclid) ? '/contact' : undefined),
    utmSource,
    utmMedium,
    utmCampaign,
    gclid,
    msclkid,
    fbclid,
  };
  const contextualProducts = compareProducts.length > 0 ? compareProducts : product ? [product] : [];
  const initialSubject = compareProducts.length > 0
    ? `Quote request: ${compareProducts.map((item) => item.grade).join(' vs ')}`
    : product
      ? `Quote request: ${product.name}`
      : '';
  const initialMessage = compareProducts.length > 0
    ? [
        'Hello,',
        '',
        `I would like pricing and availability for the following grades: ${compareNames.join(', ')}.`,
        'Please include MOQ, lead time, and any recommended alternatives if applicable.',
        '',
        'Project/application:',
        'Estimated volume:',
        'Required delivery region:',
      ].join('\n')
    : product
      ? [
          'Hello,',
          '',
          `I would like a quote for ${product.name}.`,
          'Please share pricing, MOQ, lead time, and available datasheet/documentation details.',
          '',
          'Project/application:',
          'Estimated volume:',
          'Required delivery region:',
        ].join('\n')
      : '';

  return (
    <>
      {/* Header */}
      <div className="bg-steel-950 pt-28 pb-14">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">Get in Touch</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 font-display">Contact Our Team</h1>
          <p className="text-white/60 text-base max-w-xl leading-relaxed">
            Quotes, datasheets, or material selection guidance — we'll connect you with the right engineer.
          </p>
          <div className="mt-5">
            <Link
              href="/quote?source=contact-header-cta"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-300 hover:text-brand-200 transition-colors"
            >
              Need formal pricing? Use the Quote Form →
            </Link>
          </div>
        </div>
      </div>

      {/* Enquiry type cards */}
      <div className="bg-brand-500 py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {enquiryTypes.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
                  <Icon className="h-6 w-6 text-white/80 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-white text-sm">{t.label}</p>
                    <p className="text-white/70 text-xs mt-0.5">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-background py-16">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form – wider col */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Send a Message</h2>
              {contextualProducts.length > 0 ? (
                <div className="mb-5 rounded-lg border border-brand-300/60 bg-brand-50/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 mb-2">
                    Quote Context Loaded
                  </p>
                  <p className="text-sm text-brand-900/85 mb-3">
                    {compareProducts.length > 0
                      ? 'Your comparison shortlist has been carried into the form below.'
                      : 'Your selected product has been carried into the form below.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {contextualProducts.map((item) => (
                      <span key={item.slug} className="inline-flex items-center rounded border border-brand-300 bg-background px-2.5 py-1 text-xs text-foreground">
                        {item.name}
                      </span>
                    ))}
                  </div>
                  {compareProducts.length > 0 ? (
                    <Link href={sourcePath} className="text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors">
                      Back to comparison →
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <ContactForm initialSubject={initialSubject} initialMessage={initialMessage} hiddenContext={hiddenContext} />
            </div>

            {/* Contact info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-2xl font-bold text-foreground mb-2 font-display">Direct Contact</h2>
              {contactMethods.map((m) => {
                const Icon = m.icon;
                const content = (
                  <div className="flex items-start gap-4 p-5 border border-border rounded-lg bg-muted/30 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{m.title}</p>
                      <p className="font-semibold text-foreground text-sm mt-0.5">{m.detail}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                    </div>
                  </div>
                );
                return m.href && m.href !== '#' ? (
                  <a key={m.title} href={m.href}>{content}</a>
                ) : (
                  <div key={m.title}>{content}</div>
                );
              })}

              {/* Map placeholder */}
              <div className="rounded-lg border border-border overflow-hidden bg-muted h-48 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                  <p className="text-sm">{siteConfig.contact.addressLine1}</p>
                  <p className="text-xs">{siteConfig.contact.city}, {siteConfig.contact.state} {siteConfig.contact.postalCode}</p>
                </div>
              </div>

              {/* Installation proof video */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="relative aspect-[9/16] max-h-72">
                  <ViewportVideo
                    mp4Src="/videos/installation-supply.mp4"
                    webmSrc="/videos/installation-supply.webm"
                    poster="/video-posters/installation-supply.jpg"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
                <div className="bg-steel-950 px-4 py-3">
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                    Trusted by construction companies worldwide
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    From factory floor to finished rooftop installation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
