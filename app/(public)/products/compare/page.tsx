import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, Download, MessageSquare, X } from 'lucide-react';
import { getProductBySlug, products } from '@/lib/data';
import { getCatalogueLinkProps } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CompareShareActions } from '@/components/compare-share-actions';
import { RecentComparisons } from '@/components/recent-comparisons';
import type { Product } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Compare Polycarbonate Products',
  description: 'Side-by-side technical specification comparison of polycarbonate grades.',
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string; onlydiff?: string }>;
}

const specLabels: { key: keyof Product['specifications']; label: string }[] = [
  { key: 'density', label: 'Density' },
  { key: 'tensileStrength', label: 'Tensile Strength' },
  { key: 'flexuralModulus', label: 'Flexural Modulus' },
  { key: 'impactStrength', label: 'Impact Strength' },
  { key: 'heatDeflection', label: 'Heat Deflection Temp' },
  { key: 'lightTransmittance', label: 'Light Transmittance' },
  { key: 'flamabilityRating', label: 'Flammability Rating' },
  { key: 'thicknessRange', label: 'Thickness Range' },
  { key: 'dimensions', label: 'Sheet Dimensions' },
  { key: 'meltFlowIndex', label: 'Melt Flow Index' },
];

function hasDifferences(values: string[]) {
  if (values.length <= 1) return false;
  return new Set(values.map((v) => v.trim().toLowerCase())).size > 1;
}

function removeSlugHref(slugs: string[], remove: string, showOnlyDiff: boolean) {
  const remaining = slugs.filter((s) => s !== remove);
  if (remaining.length === 0) return '/products/compare';
  const params = new URLSearchParams();
  remaining.forEach((s, i) => params.set((['a', 'b', 'c'] as const)[i]!, s));
  if (showOnlyDiff) params.set('onlydiff', '1');
  return `/products/compare?${params.toString()}`;
}

function addSlugHref(existingSlugs: string[], newSlug: string, showOnlyDiff: boolean) {
  if (existingSlugs.includes(newSlug) || existingSlugs.length >= 3) return null;
  const next = [...existingSlugs, newSlug];
  const params = new URLSearchParams();
  next.forEach((s, i) => params.set((['a', 'b', 'c'] as const)[i]!, s));
  if (showOnlyDiff) params.set('onlydiff', '1');
  return `/products/compare?${params.toString()}`;
}

export default async function ComparePage({ searchParams }: Props) {
  const query = await searchParams;
  const requestedSlugs = [query.a, query.b, query.c].filter((s): s is string => Boolean(s));
  const uniqueRequestedSlugs = Array.from(new Set(requestedSlugs));
  const duplicateCount = requestedSlugs.length - uniqueRequestedSlugs.length;
  const invalidSlugs = uniqueRequestedSlugs.filter((slug) => !getProductBySlug(slug));
  const normalizedSlugs = uniqueRequestedSlugs.filter((slug) => !invalidSlugs.includes(slug)).slice(0, 3);
  const showOnlyDiff = query.onlydiff === '1';
  const selectedProducts = normalizedSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => p !== undefined);

  // Which specs appear in at least one product
  const activeSpecKeys = specLabels.filter(({ key }) =>
    selectedProducts.some((p) => p.specifications[key])
  );

  const emptySlots = Math.max(0, 3 - selectedProducts.length);

  // Products available to add (not already selected)
  const addableProducts = products.filter((p) => !selectedProducts.some((sp) => sp.slug === p.slug));

  const selectedParams = new URLSearchParams();
  selectedProducts.forEach((p, i) => selectedParams.set((['a', 'b', 'c'] as const)[i]!, p.slug));

  const compareParams = new URLSearchParams(selectedParams);
  if (showOnlyDiff) compareParams.set('onlydiff', '1');
  const comparePath = `/products/compare?${compareParams.toString()}`;
  const compareLabel = selectedProducts.map((p) => p.name).join(' vs ');
  const quoteParams = new URLSearchParams();
  if (selectedProducts.length > 0) quoteParams.set('compare', selectedProducts.map((p) => p.slug).join(','));
  if (showOnlyDiff) quoteParams.set('onlydiff', '1');
  quoteParams.set('source', 'compare-page');
  const compareQuoteHref = quoteParams.toString() ? `/quote?${quoteParams.toString()}` : '/quote';

  const toggleDiffParams = new URLSearchParams(selectedParams);
  if (!showOnlyDiff) toggleDiffParams.set('onlydiff', '1');
  const toggleDiffPath = toggleDiffParams.toString() ? `/products/compare?${toggleDiffParams.toString()}` : '/products/compare';

  const categoryDiffers = hasDifferences(selectedProducts.map((p) => p.category));
  const certificationsDiffers = hasDifferences(
    selectedProducts.map((p) => p.certifications.join('|') || 'none')
  );
  const industriesDiffers = hasDifferences(selectedProducts.map((p) => p.industries.join('|')));
  const featuresDiffers = hasDifferences(selectedProducts.map((p) => p.features.slice(0, 4).join('|')));

  const specRows = activeSpecKeys.map(({ key, label }) => ({
    key,
    label,
    differs: hasDifferences(selectedProducts.map((p) => p.specifications[key] ?? '')),
  }));
  const visibleSpecRows = showOnlyDiff ? specRows.filter((row) => row.differs) : specRows;
  const visibleInfoRowsCount =
    visibleSpecRows.length +
    (showOnlyDiff ? (categoryDiffers ? 1 : 0) : 1) +
    (showOnlyDiff ? (certificationsDiffers ? 1 : 0) : 1) +
    (showOnlyDiff ? (industriesDiffers ? 1 : 0) : 1) +
    (showOnlyDiff ? (featuresDiffers ? 1 : 0) : 1);

  return (
    <>
      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
          </Link>
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">Grade Selection Tool</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 font-display">
            Compare Grades
          </h1>
          <p className="text-white/65 text-base max-w-2xl leading-relaxed">
            Select up to 3 polycarbonate grades to compare specifications side by side.
          </p>
        </div>
      </div>

      <div className="bg-background py-12">
        <div className="container mx-auto">
          {selectedProducts.length > 0 ? (
            <div className="hidden print:block mb-6 border-b border-border pb-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Covestro PC Comparison Sheet</p>
              <h2 className="text-2xl font-bold text-foreground font-display">{compareLabel}</h2>
              <p className="text-xs text-muted-foreground mt-1">Prepared from the live comparison tool.</p>
            </div>
          ) : null}

          {/* Empty state */}
          {selectedProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-4">No products selected. Choose grades from the catalog to compare.</p>
              <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          )}

          {(invalidSlugs.length > 0 || duplicateCount > 0) && (
            <div className="mb-4 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-xs text-amber-800 print:hidden">
              <p className="font-semibold mb-1">Some compare inputs were normalized.</p>
              {invalidSlugs.length > 0 ? (
                <p>Unknown grade slug(s) skipped: {invalidSlugs.join(', ')}.</p>
              ) : null}
              {duplicateCount > 0 ? (
                <p>Duplicate grade selections were removed automatically.</p>
              ) : null}
            </div>
          )}

          {selectedProducts.length > 0 && (
            <>
              <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between print:hidden">
                <div className="flex-1">
                  <CompareShareActions
                    comparePath={comparePath}
                    selectedCount={selectedProducts.length}
                    selectedNames={selectedProducts.map((p) => p.name)}
                    selectedProducts={selectedProducts.map((p) => ({
                      name: p.name,
                      brand: p.brand,
                      grade: p.grade,
                      category: p.category,
                      certifications: p.certifications,
                      industries: p.industries,
                      features: p.features,
                      specifications: p.specifications,
                    }))}
                    onlyDifferences={showOnlyDiff}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:self-start">
                  <Link
                    href={toggleDiffPath}
                    className={`inline-flex items-center justify-center rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      showOnlyDiff
                        ? 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600 hover:border-brand-600'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-brand-300'
                    }`}
                  >
                    {showOnlyDiff ? 'Showing only differences' : 'Show only differences'}
                  </Link>
                  <Button asChild size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
                    <Link href={compareQuoteHref}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Quote These Grades
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/products/compare">Clear Compare</Link>
                  </Button>
                </div>
              </div>

              {showOnlyDiff && visibleInfoRowsCount === 0 ? (
                <div className="mb-4 rounded-lg border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 print:hidden">
                  No differences found across selected rows. You can still use this page to quote or review details.
                </div>
              ) : null}

              <div className="overflow-x-auto compare-table-wrap">
                <table className="w-full min-w-[640px] border-collapse compare-table">
                {/* Product header row */}
                <thead>
                  <tr>
                    <th className="text-left text-xs font-bold uppercase tracking-wide text-muted-foreground px-4 py-3 w-44 bg-muted/40 rounded-tl-lg">
                      Specification
                    </th>
                    {selectedProducts.map((p) => (
                      <th key={p.id} className="px-4 py-3 text-left bg-muted/40 border-l border-border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">{p.brand} · {p.grade}</p>
                            <p className="text-sm font-bold text-foreground leading-snug">{p.name}</p>
                            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${p.inStock ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                              {p.inStock ? '● In Stock' : '● To Order'}
                            </span>
                          </div>
                          <Link
                            href={removeSlugHref(normalizedSlugs, p.slug, showOnlyDiff)}
                            aria-label={`Remove ${p.name} from comparison`}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                          >
                            <X className="h-4 w-4" />
                          </Link>
                        </div>
                      </th>
                    ))}
                    {/* Empty slot columns */}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <th key={`empty-${i}`} className="px-4 py-3 bg-muted/20 border-l border-dashed border-border text-center">
                        <p className="text-xs text-muted-foreground">Add a product</p>
                      </th>
                    ))}
                  </tr>

                  {/* Image row */}
                  <tr>
                    <td className="px-4 py-3 bg-background" />
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="px-4 py-3 border-l border-border bg-background">
                        <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted w-full max-w-[180px]">
                          <Image src={p.image} alt={p.name} fill className="object-cover object-center" sizes="200px" />
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <td key={`img-empty-${i}`} className="px-4 py-3 bg-background border-l border-dashed border-border" />
                    ))}
                  </tr>
                </thead>

                {/* Spec rows */}
                <tbody>
                  {visibleSpecRows.map(({ key, label, differs }, rowIdx) => (
                    <tr key={key} className={rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{label}</span>
                          {differs ? (
                            <span className="inline-flex rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Diff
                            </span>
                          ) : null}
                        </div>
                      </td>
                      {selectedProducts.map((p) => {
                        const val = p.specifications[key];
                        return (
                          <td key={p.id} className="px-4 py-3 border-l border-border font-mono text-xs text-foreground">
                            {val ?? <span className="text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <td key={`spec-empty-${i}`} className="px-4 py-3 border-l border-dashed border-border" />
                      ))}
                    </tr>
                  ))}

                  {/* Category */}
                  {!showOnlyDiff || categoryDiffers ? (
                    <tr className="bg-background">
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>Category</span>
                          {categoryDiffers ? (
                            <span className="inline-flex rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Diff
                            </span>
                          ) : null}
                        </div>
                      </td>
                      {selectedProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 border-l border-border text-xs text-foreground capitalize">{p.category}</td>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <td key={`cat-empty-${i}`} className="px-4 py-3 border-l border-dashed border-border" />
                      ))}
                    </tr>
                  ) : null}

                  {/* Certifications */}
                  {!showOnlyDiff || certificationsDiffers ? (
                    <tr className="bg-muted/30">
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>Certifications</span>
                          {certificationsDiffers ? (
                            <span className="inline-flex rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Diff
                            </span>
                          ) : null}
                        </div>
                      </td>
                      {selectedProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 border-l border-border">
                          <div className="flex flex-wrap gap-1">
                            {p.certifications.length > 0
                              ? p.certifications.map((c) => (
                                  <span key={c} className="text-[10px] border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">{c}</span>
                                ))
                              : <span className="text-xs text-muted-foreground">—</span>
                            }
                          </div>
                        </td>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <td key={`cert-empty-${i}`} className="px-4 py-3 border-l border-dashed border-border" />
                      ))}
                    </tr>
                  ) : null}

                  {/* Industries */}
                  {!showOnlyDiff || industriesDiffers ? (
                    <tr className="bg-background">
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground align-top pt-4">
                        <div className="flex items-center gap-2">
                          <span>Industries</span>
                          {industriesDiffers ? (
                            <span className="inline-flex rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Diff
                            </span>
                          ) : null}
                        </div>
                      </td>
                      {selectedProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 border-l border-border">
                          <div className="flex flex-wrap gap-1">
                            {p.industries.map((ind) => (
                              <span key={ind} className="text-[10px] bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded capitalize">{ind}</span>
                            ))}
                          </div>
                        </td>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <td key={`ind-empty-${i}`} className="px-4 py-3 border-l border-dashed border-border" />
                      ))}
                    </tr>
                  ) : null}

                  {/* Features */}
                  {!showOnlyDiff || featuresDiffers ? (
                    <tr className="bg-muted/30">
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground align-top pt-4">
                        <div className="flex items-center gap-2">
                          <span>Key Features</span>
                          {featuresDiffers ? (
                            <span className="inline-flex rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Diff
                            </span>
                          ) : null}
                        </div>
                      </td>
                      {selectedProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 border-l border-border">
                          <ul className="space-y-1.5">
                            {p.features.slice(0, 4).map((f) => (
                              <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-brand-500 flex-shrink-0 mt-0.5" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <td key={`feat-empty-${i}`} className="px-4 py-3 border-l border-dashed border-border" />
                      ))}
                    </tr>
                  ) : null}

                  {/* CTA row */}
                  <tr className="bg-background border-t border-border">
                    <td className="px-4 py-4" />
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="px-4 py-4 border-l border-border">
                        <div className="flex flex-col gap-2">
                          <Button asChild size="sm" className="bg-brand-500 hover:bg-brand-600 text-white w-full text-xs">
                            <Link href={`/quote?product=${p.slug}&compare=${selectedProducts.map((sp) => sp.slug).join(',')}${showOnlyDiff ? '&onlydiff=1' : ''}&source=compare-table-row`}>
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                              Request Quote
                            </Link>
                          </Button>
                          {p.datasheetUrl ? (
                            <Button asChild size="sm" variant="outline" className="w-full text-xs">
                              <a {...getCatalogueLinkProps(p.datasheetUrl)}>
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Datasheet
                              </a>
                            </Button>
                          ) : null}
                          <Link
                            href={`/products/${p.slug}`}
                            className="text-xs text-center text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                          >
                            Full details →
                          </Link>
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <td key={`cta-empty-${i}`} className="px-4 py-4 border-l border-dashed border-border" />
                    ))}
                  </tr>
                </tbody>
                </table>
              </div>
            </>
          )}

          {selectedProducts.length > 0 ? (
            <div className="mt-10">
              <RecentComparisons currentPath={comparePath} currentLabel={compareLabel} enabled={selectedProducts.length > 0} />
            </div>
          ) : null}

          {/* Add more products */}
          {selectedProducts.length < 3 && addableProducts.length > 0 && (
            <div className="mt-10 print:hidden">
              <p className="text-sm font-semibold text-foreground mb-4">
                Add a grade to compare ({3 - selectedProducts.length} slot{3 - selectedProducts.length !== 1 ? 's' : ''} remaining)
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {addableProducts.slice(0, 12).map((p) => {
                  const href = addSlugHref(normalizedSlugs, p.slug, showOnlyDiff);
                  return (
                    <article key={p.id} className="border border-border rounded-lg p-3 bg-card flex items-center gap-3 hover:border-brand-300 transition-colors">
                      <div className="relative w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground truncate">{p.brand}</p>
                        <p className="text-xs font-semibold text-foreground leading-snug truncate">{p.name}</p>
                      </div>
                      {href ? (
                        <Link
                          href={href}
                          className="text-[11px] font-bold text-brand-600 hover:text-brand-700 whitespace-nowrap transition-colors flex-shrink-0"
                        >
                          + Add
                        </Link>
                      ) : null}
                    </article>
                  );
                })}
              </div>
              {addableProducts.length > 12 && (
                <Link href="/products" className="mt-4 inline-flex text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  Browse all {products.length} grades →
                </Link>
              )}
            </div>
          )}

          {selectedProducts.length > 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 sm:p-6 print:hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500 mb-1">Ready To Quote</p>
                  <h2 className="text-lg font-bold text-foreground font-display">Send your compared grades to sales in one step</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    We will prefill the contact form with your selected grades so your team can request pricing, MOQ, and lead-time guidance without retyping product names.
                  </p>
                </div>
                <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white">
                  <Link href={compareQuoteHref}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Quote for Compared Grades
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
