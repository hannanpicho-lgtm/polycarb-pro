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
          <p className="text-white/60 text-base max-w-2xl leading-relaxed">
            Share grade selection, quantities, and destination details. Our team returns pricing and availability within 1 business day.
          </p>
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