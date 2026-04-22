import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Download, Sparkles } from 'lucide-react';
import { blogPosts, datasheetLibrary, getRecentDatasheets, getUnmappedDatasheets } from '@/lib/data';
import { getCatalogueLinkProps } from '@/lib/utils';

interface Props {
  searchParams: Promise<{
    brand?: string;
    type?: string;
    family?: string;
    q?: string;
    sort?: string;
    page?: string;
    onlynew?: string;
  }>;
}

const DATASHEETS_PER_PAGE = 9;
const NEW_BADGE_WINDOW_DAYS = 30;

export const metadata: Metadata = {
  title: 'Resources & Blog',
  description: 'Technical articles and market insights on polycarbonate materials, applications, and processing.',
};

export default async function ResourcesPage({ searchParams }: Props) {
  const query = await searchParams;
  const recentDatasheets = getRecentDatasheets(4);
  const unmappedDatasheets = getUnmappedDatasheets();
  const now = new Date();
  const newBadgeCutoff = new Date(now);
  newBadgeCutoff.setDate(newBadgeCutoff.getDate() - NEW_BADGE_WINDOW_DAYS);
  const showOnlyNew = query.onlynew === '1';
  const newDocCount = datasheetLibrary.filter((doc) => new Date(doc.publishedAt).getTime() >= newBadgeCutoff.getTime()).length;
  const selectedBrand = query.brand ?? 'all';
  const selectedType = query.type ?? 'all';
  const selectedFamily = query.family ?? 'all';
  const searchQuery = (query.q ?? '').trim();
  const selectedSort = query.sort ?? 'title-asc';
  const requestedPage = Number.parseInt(query.page ?? '1', 10);

  const brands = Array.from(new Set(datasheetLibrary.map((doc) => doc.brand))).sort((a, b) => a.localeCompare(b));
  const documentTypes = Array.from(new Set(datasheetLibrary.map((doc) => doc.type))).sort((a, b) => a.localeCompare(b));
  const materialFamilies = Array.from(new Set(datasheetLibrary.map((doc) => doc.materialFamily))).sort((a, b) => a.localeCompare(b));

  const filteredDatasheets = datasheetLibrary.filter((doc) => {
    if (showOnlyNew && new Date(doc.publishedAt).getTime() < newBadgeCutoff.getTime()) return false;
    const matchesBrand = selectedBrand === 'all' || doc.brand === selectedBrand;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesFamily = selectedFamily === 'all' || doc.materialFamily === selectedFamily;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch =
      lowerQuery.length === 0
      || doc.title.toLowerCase().includes(lowerQuery)
      || doc.brand.toLowerCase().includes(lowerQuery)
      || doc.type.toLowerCase().includes(lowerQuery)
      || doc.materialFamily.toLowerCase().includes(lowerQuery);
    return matchesBrand && matchesType && matchesFamily && matchesSearch;
  });

  const sortedDatasheets = [...filteredDatasheets].sort((a, b) => {
    if (selectedSort === 'date-desc') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (selectedSort === 'date-asc') return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    if (selectedSort === 'title-desc') return b.title.localeCompare(a.title);
    if (selectedSort === 'brand-asc') {
      const brandCompare = a.brand.localeCompare(b.brand);
      return brandCompare !== 0 ? brandCompare : a.title.localeCompare(b.title);
    }
    if (selectedSort === 'type-asc') {
      const typeCompare = a.type.localeCompare(b.type);
      return typeCompare !== 0 ? typeCompare : a.title.localeCompare(b.title);
    }
    return a.title.localeCompare(b.title);
  });

  const totalPages = Math.max(1, Math.ceil(sortedDatasheets.length / DATASHEETS_PER_PAGE));
  const currentPage = Number.isNaN(requestedPage)
    ? 1
    : Math.min(Math.max(requestedPage, 1), totalPages);
  const paginatedDatasheets = sortedDatasheets.slice(
    (currentPage - 1) * DATASHEETS_PER_PAGE,
    currentPage * DATASHEETS_PER_PAGE
  );

  const buildFilterHref = (updates: { brand?: string; type?: string; family?: string; q?: string; sort?: string; page?: string; onlynew?: string }) => {
    const nextBrand = updates.brand ?? selectedBrand;
    const nextType = updates.type ?? selectedType;
    const nextFamily = updates.family ?? selectedFamily;
    const nextQuery = updates.q ?? searchQuery;
    const nextSort = updates.sort ?? selectedSort;
    const nextPage = updates.page ?? '1';
    const nextOnlyNew = updates.onlynew !== undefined ? updates.onlynew : (showOnlyNew ? '1' : '');
    const params = new URLSearchParams();

    if (nextBrand !== 'all') params.set('brand', nextBrand);
    if (nextType !== 'all') params.set('type', nextType);
    if (nextFamily !== 'all') params.set('family', nextFamily);
    if (nextQuery.length > 0) params.set('q', nextQuery);
    if (nextSort !== 'title-asc') params.set('sort', nextSort);
    if (nextPage !== '1') params.set('page', nextPage);
    if (nextOnlyNew === '1') params.set('onlynew', '1');

    const queryString = params.toString();
    return queryString ? `/resources?${queryString}` : '/resources';
  };

  const activeChips = [
    selectedBrand !== 'all'
      ? { key: 'brand', label: `Brand: ${selectedBrand}`, href: buildFilterHref({ brand: 'all' }) }
      : null,
    selectedType !== 'all'
      ? { key: 'type', label: `Type: ${selectedType}`, href: buildFilterHref({ type: 'all' }) }
      : null,
    selectedFamily !== 'all'
      ? { key: 'family', label: `Material: ${selectedFamily}`, href: buildFilterHref({ family: 'all' }) }
      : null,
    searchQuery.length > 0
      ? { key: 'q', label: `Search: ${searchQuery}`, href: buildFilterHref({ q: '' }) }
      : null,
    selectedSort !== 'title-asc'
      ? {
          key: 'sort',
          label:
            selectedSort === 'title-desc'
              ? 'Sort: Title Z-A'
              : selectedSort === 'date-desc'
                ? 'Sort: Newest first'
                : selectedSort === 'date-asc'
                  ? 'Sort: Oldest first'
              : selectedSort === 'brand-asc'
                ? 'Sort: Brand'
                : 'Sort: Type',
          href: buildFilterHref({ sort: 'title-asc' }),
        }
      : null,
    showOnlyNew
      ? { key: 'onlynew', label: 'New documents only', href: buildFilterHref({ onlynew: '0' }) }
      : null,
  ].filter((chip): chip is { key: string; label: string; href: string } => chip !== null);

  return (
    <>
      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">Knowledge Centre</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 font-display">Insights & Technical Briefs</h1>
          <p className="text-white/65 text-base max-w-3xl leading-relaxed">
            Material selection, sustainability, compliance, and processing — engineering-grade knowledge for engineering-grade projects.
          </p>
        </div>
      </div>

      <div className="bg-background py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {blogPosts.map((post, idx) => (
            <article key={post.id} className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-md hover:border-brand-200 transition-all duration-300">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  fetchPriority={idx < 2 ? 'high' : 'auto'}
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{post.category}</p>
                <h2 className="text-sm font-bold text-foreground leading-tight mb-2">{post.title}</h2>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {post.readTime} min
                  </span>
                  <Link
                    href={`/resources/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="container mx-auto mt-14">
          <div className="mb-6">
            <p className="text-brand-500 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">Datasheet Library</p>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">Technical Downloads</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Access product-aligned polycarbonate datasheets plus additional engineering references from our extended materials library.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-500 mb-1">New in Library</p>
                <h3 className="text-base sm:text-lg font-bold text-foreground font-display">Recently Added Datasheets</h3>
              </div>
              <Link href={buildFilterHref({ sort: 'date-desc' })} className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                View newest first
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentDatasheets.map((doc) => (
                <article key={doc.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    {doc.brand} · {new Date(doc.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <h4 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2">{doc.title}</h4>
                  <a
                    {...getCatalogueLinkProps(doc.url)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Download <Download className="h-3.5 w-3.5" />
                  </a>
                </article>
              ))}
            </div>
          </div>

          <form method="get" action="/resources" className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
            {selectedBrand !== 'all' ? <input type="hidden" name="brand" value={selectedBrand} /> : null}
            {selectedType !== 'all' ? <input type="hidden" name="type" value={selectedType} /> : null}
            {selectedFamily !== 'all' ? <input type="hidden" name="family" value={selectedFamily} /> : null}
            {selectedSort !== 'title-asc' ? <input type="hidden" name="sort" value={selectedSort} /> : null}
            {showOnlyNew ? <input type="hidden" name="onlynew" value="1" /> : null}
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by title, brand, type, or material"
              className="w-full sm:max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search datasheets"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Search
            </button>
            {searchQuery.length > 0 ? (
              <Link
                href={buildFilterHref({ q: '' })}
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                Clear
              </Link>
            ) : null}
          </form>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Sort</span>
            <Link
              href={buildFilterHref({ sort: 'title-asc' })}
              className={`text-xs px-3 py-1 rounded border transition-colors ${selectedSort === 'title-asc' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              Title A-Z
            </Link>
            <Link
              href={buildFilterHref({ sort: 'date-desc' })}
              className={`text-xs px-3 py-1 rounded border transition-colors ${selectedSort === 'date-desc' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              Newest
            </Link>
            <Link
              href={buildFilterHref({ sort: 'date-asc' })}
              className={`text-xs px-3 py-1 rounded border transition-colors ${selectedSort === 'date-asc' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              Oldest
            </Link>
            <Link
              href={buildFilterHref({ sort: 'title-desc' })}
              className={`text-xs px-3 py-1 rounded border transition-colors ${selectedSort === 'title-desc' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              Title Z-A
            </Link>
            <Link
              href={buildFilterHref({ sort: 'brand-asc' })}
              className={`text-xs px-3 py-1 rounded border transition-colors ${selectedSort === 'brand-asc' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              Brand
            </Link>
            <Link
              href={buildFilterHref({ sort: 'type-asc' })}
              className={`text-xs px-3 py-1 rounded border transition-colors ${selectedSort === 'type-asc' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              Type
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Quick Filter</span>
            <Link
              href={showOnlyNew ? buildFilterHref({ onlynew: '0' }) : buildFilterHref({ onlynew: '1' })}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded border transition-colors font-semibold ${showOnlyNew ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
            >
              <Sparkles className="h-3 w-3" />
              New Only{newDocCount > 0 ? ` (${newDocCount})` : ''}
            </Link>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Brand</span>
              <Link
                href={buildFilterHref({ brand: 'all' })}
                className={`text-xs px-3 py-1 rounded border transition-colors ${selectedBrand === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
              >
                All
              </Link>
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={buildFilterHref({ brand })}
                  className={`text-xs px-3 py-1 rounded border transition-colors ${selectedBrand === brand ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
                >
                  {brand}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Type</span>
              <Link
                href={buildFilterHref({ type: 'all' })}
                className={`text-xs px-3 py-1 rounded border transition-colors ${selectedType === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
              >
                All
              </Link>
              {documentTypes.map((type) => (
                <Link
                  key={type}
                  href={buildFilterHref({ type })}
                  className={`text-xs px-3 py-1 rounded border transition-colors ${selectedType === type ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
                >
                  {type}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Material</span>
              <Link
                href={buildFilterHref({ family: 'all' })}
                className={`text-xs px-3 py-1 rounded border transition-colors ${selectedFamily === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
              >
                All
              </Link>
              {materialFamilies.map((family) => (
                <Link
                  key={family}
                  href={buildFilterHref({ family })}
                  className={`text-xs px-3 py-1 rounded border transition-colors ${selectedFamily === family ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
                >
                  {family}
                </Link>
              ))}
            </div>
          </div>

          {activeChips.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Active</span>
              {activeChips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.href}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:border-brand-300 hover:bg-brand-100 transition-colors"
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                </Link>
              ))}
              <Link
                href="/resources"
                className="text-xs font-semibold text-muted-foreground hover:text-brand-700 transition-colors"
              >
                Clear all
              </Link>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDatasheets.map((doc) => (
              <article key={doc.id} className="border border-border rounded-lg bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{doc.brand} · {doc.type}</p>
                    <h3 className="text-sm font-semibold text-foreground mt-1 leading-snug">{doc.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {new Date(doc.publishedAt).getTime() >= newBadgeCutoff.getTime() ? (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-brand-500 text-white whitespace-nowrap font-semibold">
                        New
                      </span>
                    ) : null}
                    <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                      {doc.materialFamily}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {doc.relatedProductSlugs.length > 0 ? `Mapped to ${doc.relatedProductSlugs.length} product(s)` : 'General reference'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                      Added {new Date(doc.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <a
                    {...getCatalogueLinkProps(doc.url)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Download <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {sortedDatasheets.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">
              No datasheets match the current filters. Clear one or more filters to broaden results.
            </p>
          ) : null}

          {sortedDatasheets.length > 0 ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {paginatedDatasheets.length} result(s) on page {currentPage} of {totalPages}. Filtered from {datasheetLibrary.length} datasheet document(s).
              </p>

              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={buildFilterHref({ page: String(Math.max(1, currentPage - 1)) })}
                    className={`text-xs px-3 py-1 rounded border transition-colors ${currentPage === 1 ? 'pointer-events-none border-border text-muted-foreground/50' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
                  >
                    Previous
                  </Link>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={buildFilterHref({ page: String(pageNumber) })}
                      className={`text-xs px-3 py-1 rounded border transition-colors ${currentPage === pageNumber ? 'bg-brand-500 text-white border-brand-500' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
                    >
                      {pageNumber}
                    </Link>
                  ))}
                  <Link
                    href={buildFilterHref({ page: String(Math.min(totalPages, currentPage + 1)) })}
                    className={`text-xs px-3 py-1 rounded border transition-colors ${currentPage === totalPages ? 'pointer-events-none border-border text-muted-foreground/50' : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'}`}
                  >
                    Next
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {unmappedDatasheets.length > 0 ? (
            <p className="text-xs text-muted-foreground mt-4">
              {unmappedDatasheets.length} document(s) are currently listed as general references and not tied to a specific product SKU.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
