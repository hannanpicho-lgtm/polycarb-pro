import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { ArrowRight, CheckCircle2, Download, PackageSearch, X } from 'lucide-react';
import { products } from '@/lib/data';
import { filterByPublicProductVisibility, getPublicHiddenProductSlugs } from '@/lib/public-catalog';
import {
  COMPARE_QUERY_PARAM_KEYS,
  PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS,
  PUBLIC_COMPARE_MAX_SLUGS,
} from '@/lib/public-catalog-constants';
import { getCatalogueLinkProps } from '@/lib/utils';
import { ProductFilters } from '@/components/product-filters';
import { PublicHiddenSlugsHydrate } from '@/components/public-hidden-slugs-hydrate';
import { RecentComparisons } from '@/components/recent-comparisons';
import { Button } from '@/components/ui/button';
import type { ProductCategory, ProductIndustry } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Polycarbonate Products',
  description:
    'Browse our complete range of polycarbonate sheets, rods, resins, and specialty compounds. Filter by material type and industry application.',
};

const categoryColorMap: Record<ProductCategory, { badge: string; label: string }> = {
  sheets: { badge: 'bg-blue-600 text-white', label: 'PC Sheet' },
  rods: { badge: 'bg-slate-600 text-white', label: 'Rod / Profile' },
  resins: { badge: 'bg-purple-600 text-white', label: 'Resin / Compound' },
  specialty: { badge: 'bg-orange-500 text-white', label: 'Specialty Grade' },
};

interface SearchParams {
  q?: string;
  category?: string;
  industry?: string;
  brand?: string;
  sort?: string;
  instock?: string;
  ca?: string;
  cb?: string;
  cc?: string;
}

const categorySections: Record<ProductCategory, { title: string; description: string }> = {
  sheets: {
    title: 'Sheets',
    description: 'Solid, twinwall, and specialty sheet formats for glazing and protection.',
  },
  rods: {
    title: 'Rods & Profiles',
    description: 'Extruded rods, tubes, and profile forms for machining and structural parts.',
  },
  resins: {
    title: 'Resins',
    description: 'Injection and extrusion grades for high-throughput production.',
  },
  specialty: {
    title: 'Specialty Grades',
    description: 'Application-specific compounds for optical, high-heat, and advanced use cases.',
  },
};

function diversifyProductOrder(items: (typeof products)[number][]): (typeof products)[number][] {
  const groups = new Map<string, (typeof products)[number][]>();
  for (const item of items) {
    const key = `${item.subtype}|${item.brand}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  const result: (typeof products)[number][] = [];
  const groupEntries = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);

  while (groupEntries.some(([, bucket]) => bucket.length > 0)) {
    for (const [, bucket] of groupEntries) {
      const next = bucket.shift();
      if (next) result.push(next);
    }
  }

  return result;
}

function productsHrefWithCompare(params: SearchParams, compareSlugs: string[]) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.category) query.set('category', params.category);
  if (params.industry) query.set('industry', params.industry);
  if (params.brand) query.set('brand', params.brand);
  if (params.sort) query.set('sort', params.sort);
  if (params.instock) query.set('instock', params.instock);

  compareSlugs.slice(0, PUBLIC_COMPARE_MAX_SLUGS).forEach((slug, i) => {
    query.set(PRODUCTS_SHORTLIST_QUERY_PARAM_KEYS[i]!, slug);
  });

  const qs = query.toString();
  return qs ? `/products?${qs}` : '/products';
}

function filterProducts(params: SearchParams) {
  let filtered = products;

  if (params.instock === '1') {
    filtered = filtered.filter((p) => p.inStock);
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  if (params.category && params.category !== 'all') {
    filtered = filtered.filter((p) => p.category === (params.category as ProductCategory));
  }

  if (params.industry && params.industry !== 'all') {
    filtered = filtered.filter((p) => p.industries.includes(params.industry as ProductIndustry));
  }

  if (params.brand && params.brand !== 'all') {
    filtered = filtered.filter((p) => p.brand === params.brand);
  }

  const sort = params.sort ?? 'name-asc';
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name-desc') return b.name.localeCompare(a.name);
    if (sort === 'brand-asc') {
      const brandCmp = a.brand.localeCompare(b.brand);
      return brandCmp !== 0 ? brandCmp : a.name.localeCompare(b.name);
    }
    if (sort === 'instock-first') {
      if (a.inStock === b.inStock) return a.name.localeCompare(b.name);
      return a.inStock ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return sorted;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const hidden = await getPublicHiddenProductSlugs();
  const filtered = filterByPublicProductVisibility(filterProducts(params), hidden);
  const compareSlugs = Array.from(
    new Set([params.ca, params.cb, params.cc].filter(Boolean) as string[])
  )
    .filter((s) => !hidden.has(s))
    .slice(0, PUBLIC_COMPARE_MAX_SLUGS);
  const compareProducts = compareSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is (typeof products)[number] => p !== undefined);
  const comparePageParams = new URLSearchParams();
  compareProducts.forEach((p, i) => comparePageParams.set(COMPARE_QUERY_PARAM_KEYS[i]!, p.slug));
  const comparePageHref = comparePageParams.toString()
    ? `/products/compare?${comparePageParams.toString()}`
    : '/products/compare';
  const isCatalogView = !params.q && !params.category && !params.industry && !params.brand;
  const diversifiedFiltered = diversifyProductOrder(filtered);
  const groupedProducts = (Object.keys(categorySections) as ProductCategory[]).map((category) => ({
    category,
    products: diversifyProductOrder(filtered.filter((p) => p.category === category)),
  }));

  const activeFiltersCount = [
    params.q,
    params.category !== 'all' && params.category,
    params.industry !== 'all' && params.industry,
    params.brand !== 'all' && params.brand,
    params.sort && params.sort !== 'name-asc',
    params.instock === '1',
  ].filter(Boolean).length;

  return (
    <>
      <PublicHiddenSlugsHydrate slugs={Array.from(hidden)} />
      {/* Page Header */}
      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
            Product Catalogue
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 font-display">
            Polycarbonate Products
          </h1>
          <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6">
            {filtered.length} grade{filtered.length !== 1 ? 's' : ''} from world-leading producers.
            Filter by type, industry, or brand — then build an instant quote.
          </p>
          <Link
            href="/quote/builder"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-900/30"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
            Build a Quote — Live Pricing
          </Link>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto py-3">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </div>
      </div>

      <div className="container mx-auto py-12">
        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
            {params.q && <FilterChip label={`"${params.q}"`} />}
            {params.category && params.category !== 'all' && <FilterChip label={params.category} />}
            {params.industry && params.industry !== 'all' && <FilterChip label={params.industry} />}
            {params.brand && params.brand !== 'all' && <FilterChip label={params.brand} />}
            {params.sort && params.sort !== 'name-asc' && (
              <FilterChip
                label={
                  params.sort === 'name-desc'
                    ? 'Sort: Name Z-A'
                    : params.sort === 'brand-asc'
                      ? 'Sort: Brand'
                      : 'Sort: In-Stock First'
                }
              />
            )}
            {params.instock === '1' && <FilterChip label="In Stock Only" />}
          </div>
        )}

        {compareProducts.length > 0 && (
          <div className="mb-6 rounded-lg border border-brand-300/60 bg-brand-50/60 p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700 mb-1">
                  Compare Shortlist
                </p>
                <p className="text-xs text-brand-800/80">
                  {compareProducts.length} of {PUBLIC_COMPARE_MAX_SLUGS} selected. Add from cards
                  below, then launch side-by-side comparison.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {compareProducts.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 rounded border border-brand-300 bg-background px-2 py-1 text-[11px] text-foreground"
                    >
                      <span className="truncate max-w-[170px]">{p.name}</span>
                      <Link
                        href={productsHrefWithCompare(
                          params,
                          compareSlugs.filter((slug) => slug !== p.slug)
                        )}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${p.name} from compare shortlist`}
                      >
                        <X className="h-3 w-3" />
                      </Link>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
                  <Link href={comparePageHref}>Compare now</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={productsHrefWithCompare(params, [])}>Clear shortlist</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <RecentComparisons
            currentPath="/products/compare"
            currentLabel="Current compare"
            enabled={false}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Product Category Showcase — Only shown when viewing all products (no filters) */}
            {isCatalogView && filtered.length > 0 && (
              <div className="mb-12">
                <div className="text-center mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">
                    Product Categories
                  </p>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Complete Material Range
                  </h3>
                  <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                    Whether you need precision sheets, engineered rods, advanced resins, or
                    specialized compounds — we stock the complete spectrum.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sheets */}
                  <Link
                    href="?category=sheets"
                    className="group relative overflow-hidden rounded-lg aspect-square bg-muted border border-border hover:border-brand-400 transition-all duration-300"
                  >
                    <Image
                      src="/pictures/polycarbonate-sheet-panel.webp"
                      alt="Polycarbonate sheets for construction and industrial use"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="font-bold text-sm">Sheets</p>
                      <p className="text-xs text-white/70">Precision cut & molded</p>
                    </div>
                  </Link>

                  {/* Rods */}
                  <Link
                    href="?category=rods"
                    className="group relative overflow-hidden rounded-lg aspect-square bg-muted border border-border hover:border-brand-400 transition-all duration-300"
                  >
                    <Image
                      src="/pictures/polycarbonate-parts-1024x716.jpg"
                      alt="Polycarbonate rods and profiles for industrial components"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="font-bold text-sm">Rods & Profiles</p>
                      <p className="text-xs text-white/70">Engineered forms</p>
                    </div>
                  </Link>

                  {/* Resins */}
                  <Link
                    href="?category=resins"
                    className="group relative overflow-hidden rounded-lg aspect-square bg-muted border border-border hover:border-brand-400 transition-all duration-300"
                  >
                    <Image
                      src="/pictures/polycarbonate-resin-grade.webp"
                      alt="Advanced polycarbonate resin grades and compounds"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="font-bold text-sm">Resins</p>
                      <p className="text-xs text-white/70">Raw materials & compounds</p>
                    </div>
                  </Link>

                  {/* Specialty */}
                  <Link
                    href="?category=specialty"
                    className="group relative overflow-hidden rounded-lg aspect-square bg-muted border border-border hover:border-brand-400 transition-all duration-300"
                  >
                    <Image
                      src="/pictures/BMW-Laser-light-detail-on-G15-8-Series.jpg"
                      alt="Specialty polycarbonate grades for optical and automotive applications"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="font-bold text-sm">Specialty</p>
                      <p className="text-xs text-white/70">Performance grades</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {isCatalogView ? (
              <div className="space-y-10">
                {groupedProducts.map(({ category, products: categoryProducts }) => {
                  if (categoryProducts.length === 0) return null;
                  return (
                    <section key={category}>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-foreground font-display">
                          {categorySections[category].title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {categorySections[category].description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {categoryProducts.map((product, idx) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            idx={idx}
                            compareSlugs={compareSlugs}
                            comparePageHref={comparePageHref}
                            addToCompareHref={productsHrefWithCompare(params, [
                              ...compareSlugs,
                              product.slug,
                            ])}
                            removeFromCompareHref={productsHrefWithCompare(
                              params,
                              compareSlugs.filter((slug) => slug !== product.slug)
                            )}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {diversifiedFiltered.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    idx={idx}
                    compareSlugs={compareSlugs}
                    comparePageHref={comparePageHref}
                    addToCompareHref={productsHrefWithCompare(params, [
                      ...compareSlugs,
                      product.slug,
                    ])}
                    removeFromCompareHref={productsHrefWithCompare(
                      params,
                      compareSlugs.filter((slug) => slug !== product.slug)
                    )}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function ProductCard({
  product,
  idx,
  compareSlugs,
  comparePageHref,
  addToCompareHref,
  removeFromCompareHref,
}: {
  product: (typeof products)[number];
  idx: number;
  compareSlugs: string[];
  comparePageHref: string;
  addToCompareHref: string;
  removeFromCompareHref: string;
}) {
  const cat = categoryColorMap[product.category]!;
  const isInCompare = compareSlugs.includes(product.slug);
  const canAddToCompare = !isInCompare && compareSlugs.length < PUBLIC_COMPARE_MAX_SLUGS;

  return (
    <article className="group flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          loading={idx < 2 ? 'eager' : 'lazy'}
          fetchPriority={idx < 2 ? 'high' : 'auto'}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {!product.inStock && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-sm uppercase">
              Order
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Cat badge */}
        <span className={`tag-pill ${cat.badge} self-start mb-2.5`}>{cat.label}</span>

        {/* Brand */}
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
          {product.brand} - {product.grade}
        </p>

        {/* Name */}
        <h2 className="font-bold text-sm leading-tight text-foreground mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          <Link href={`/products/${product.slug}`} className="stretched-link">
            {product.name}
          </Link>
        </h2>

        {/* Short desc */}
        <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Top specs */}
        {product.specifications.heatDeflection && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-brand-500 flex-shrink-0" />
            HDT {product.specifications.heatDeflection}
          </div>
        )}
        {product.specifications.lightTransmittance && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <CheckCircle2 className="h-3 w-3 text-brand-500 flex-shrink-0" />
            {product.specifications.lightTransmittance} transmittance
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href={
              isInCompare
                ? removeFromCompareHref
                : canAddToCompare
                  ? addToCompareHref
                  : comparePageHref
            }
            className={`text-xs transition-colors font-medium ${isInCompare ? 'text-brand-700' : 'text-muted-foreground hover:text-brand-600'}`}
            title={
              isInCompare
                ? 'Remove from shortlist'
                : canAddToCompare
                  ? 'Add to compare shortlist'
                  : 'Shortlist full; open compare'
            }
          >
            {isInCompare ? 'Added' : canAddToCompare ? 'Add compare' : 'Compare'}
          </Link>
          <div className="flex-1" />
          {product.datasheetUrl ? (
            <Button asChild size="sm" variant="ghost" className="text-xs h-7 px-2">
              <a
                {...getCatalogueLinkProps(product.datasheetUrl)}
                aria-label={`Download catalogue for ${product.name}`}
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              disabled
              aria-label={`Catalogue unavailable for ${product.name}`}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            asChild
            size="sm"
            className="text-xs h-7 px-3 bg-brand-500 hover:bg-brand-600 text-white border-0"
          >
            <Link href={`/quote/builder?product=${product.slug}&source=products-catalog-card`}>
              Get Quote
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium px-2.5 py-1 rounded-sm capitalize">
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <PackageSearch
        className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 className="text-xl font-bold text-foreground mb-2">No products match your filters</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
        Try broadening your search or removing filters. Can't find what you need? Our team can
        source specialty grades on request.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/products">Clear all filters</Link>
        </Button>
        <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white">
          <Link href="/contact?source=products-empty-state">Contact our team</Link>
        </Button>
      </div>
    </div>
  );
}
