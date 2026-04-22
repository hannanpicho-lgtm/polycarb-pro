import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import { getProductBySlug } from '@/lib/data';
import { QuoteRequestForm } from '@/components/quote-request-form';

export const metadata: Metadata = {
  title: 'Request A Quote',
  description: 'Submit a formal quote request for polycarbonate grades with project details and volume requirements.',
};

interface QuoteSearchParams {
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

export default async function QuotePage({ searchParams }: { searchParams: Promise<QuoteSearchParams> }) {
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
    ? `/products/compare?${compareProducts.map((item, i) => `${(['a', 'b', 'c'] as const)[i]}=${item.slug}`).join('&')}${params.onlydiff === '1' ? '&onlydiff=1' : ''}`
    : product
      ? `/products/${product.slug}`
      : '/quote';

  const hiddenContext = {
    leadSource: params.source ?? (compareProducts.length > 0 ? 'compare-page' : product ? 'product-page' : 'quote-page'),
    compareSlugs: compareSlugs.length > 0 ? compareSlugs.join(',') : undefined,
    compareNames: compareNames.length > 0 ? compareNames.join(' | ') : undefined,
    compareOnlyDiff: compareProducts.length > 0 ? (params.onlydiff === '1' ? '1' : '0') : undefined,
    sourcePath,
    landingPath: landingPath ?? ((gclid || msclkid || fbclid) ? '/quote' : undefined),
    utmSource,
    utmMedium,
    utmCampaign,
    gclid,
    msclkid,
    fbclid,
  };

  const initialProduct = compareProducts.length > 0
    ? compareProducts.map((item) => `${item.brand} ${item.grade}`).join(' | ')
    : product
      ? product.name
      : '';

  const initialMessage = compareProducts.length > 0
    ? [
        'Hello,',
        '',
        `Please provide pricing for the following compared grades: ${compareNames.join(', ')}.`,
        'Include MOQ, lead time, and alternatives if any grade is constrained.',
        '',
        'Project/application:',
        'Target region:',
        'Estimated monthly volume:',
      ].join('\n')
    : product
      ? [
          'Hello,',
          '',
          `Please provide a quote for ${product.name}.`,
          'Include MOQ, lead time, and available alternatives if applicable.',
          '',
          'Project/application:',
          'Target region:',
          'Estimated monthly volume:',
        ].join('\n')
      : 'Please provide pricing, MOQ, and lead time for the requested materials.';

  return (
    <>
      <div className="bg-steel-950 pt-28 pb-14">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">Procurement Intake</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 font-display">Request A Formal Quote</h1>
          <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6">
            Share grade selection, quantities, and destination details. Our team returns pricing and availability within 1 business day.
          </p>
          <Link
            href="/quote/builder"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            Try the Live Quote Builder →
          </Link>
        </div>
      </div>

      <div className="bg-background py-16">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              {initialProduct ? (
                <div className="mb-5 rounded-lg border border-brand-300/60 bg-brand-50/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 mb-2">Quote Context Loaded</p>
                  <p className="text-sm text-brand-900/85 mb-3">Your selected products have been preloaded into the request form.</p>
                  <p className="text-xs text-foreground font-mono break-words">{initialProduct}</p>
                  <Link href={sourcePath} className="inline-block mt-3 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors">
                    Return to previous page →
                  </Link>
                </div>
              ) : null}

              <QuoteRequestForm initialProduct={initialProduct} initialMessage={initialMessage} hiddenContext={hiddenContext} />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-brand-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Commercial Response</p>
                    <p className="text-xs text-muted-foreground mt-1">Pricing, MOQ, and lead-time turnaround within 1 business day.</p>
                  </div>
                </div>
              </div>
              <div className="p-5 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-brand-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Documentation Support</p>
                    <p className="text-xs text-muted-foreground mt-1">Datasheets and compliance documentation can be attached in follow-up.</p>
                  </div>
                </div>
              </div>
              <div className="p-5 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Procurement-Ready Trail</p>
                    <p className="text-xs text-muted-foreground mt-1">Each request is assigned a submission reference for tracking and support.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}