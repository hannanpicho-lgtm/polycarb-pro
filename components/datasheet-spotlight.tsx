import Link from 'next/link';
import { ArrowRight, BookOpenText, FileText, ShieldCheck } from 'lucide-react';
import { datasheetLibrary, getRecentDatasheets } from '@/lib/data';

const spotlightCards = [
  {
    title: 'Primary Datasheets',
    description:
      'Start with the core spec sheets tied to our stocked polycarbonate grades and commercial resin families.',
    href: '/resources?type=Primary+Datasheet&sort=brand-asc',
    icon: FileText,
    count: datasheetLibrary.filter((doc) => doc.type === 'Primary Datasheet').length,
    accent: 'from-brand-500/20 via-brand-500/5 to-transparent',
  },
  {
    title: 'Brochures & Grade Guides',
    description:
      'Compare supplier portfolios, solution guides, and broader application references before narrowing to a SKU.',
    href: '/resources?type=Brochure&sort=brand-asc',
    icon: BookOpenText,
    count: datasheetLibrary.filter((doc) => doc.type === 'Brochure').length,
    accent: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
  },
  {
    title: 'Engineering References',
    description:
      'Surface technical notes, compliance materials, and non-polycarbonate engineering plastic references in one pass.',
    href: '/resources?family=Engineering+Plastics&sort=title-asc',
    icon: ShieldCheck,
    count: datasheetLibrary.filter((doc) => doc.materialFamily === 'Engineering Plastics').length,
    accent: 'from-amber-500/20 via-amber-500/5 to-transparent',
  },
];

export function DatasheetSpotlight() {
  const now = new Date();
  const docsThisMonth = datasheetLibrary
    .filter((doc) => {
      const published = new Date(doc.publishedAt);
      return (
        published.getFullYear() === now.getFullYear() && published.getMonth() === now.getMonth()
      );
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  const recentDocs = docsThisMonth.length > 0 ? docsThisMonth : getRecentDatasheets(3);
  const latestDoc = recentDocs[0];
  const latestStampDate = latestDoc ? new Date(latestDoc.publishedAt) : now;
  const latestStampLabel = latestStampDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="bg-steel-950 py-20" aria-labelledby="datasheet-spotlight-heading">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
              Technical Downloads
            </p>
            <h2
              id="datasheet-spotlight-heading"
              className="text-3xl md:text-4xl font-bold text-white leading-tight font-display"
            >
              Fast routes into the datasheet library
            </h2>
            <p className="text-white/65 text-sm md:text-base leading-relaxed mt-3">
              Jump directly into pre-filtered technical documents for supplier comparisons, core
              specification sheets, and engineering references.
            </p>
          </div>

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white transition-colors"
          >
            Browse full library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {spotlightCards.map(({ title, description, href, icon: Icon, count, accent }) => (
            <Link
              key={title}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-brand-400/40 transition-colors"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-white/55 font-semibold">
                    {count} documents
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-display mb-2 group-hover:text-brand-200 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-white/65 leading-relaxed mb-6">{description}</p>

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 group-hover:text-white transition-colors">
                  Open filtered view{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {recentDocs.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <p className="text-brand-300 text-[11px] font-bold uppercase tracking-[0.15em] mb-1">
                  What&apos;s New This Month
                </p>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white">
                  Fresh technical documents
                </h3>
              </div>
              <span className="text-xs text-white/55 uppercase tracking-[0.12em] font-semibold">
                Updated {latestStampLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/resources?brand=${encodeURIComponent(doc.brand)}&sort=date-desc&q=${encodeURIComponent(doc.title)}`}
                  className="rounded-xl border border-white/10 bg-steel-900/60 p-4 hover:border-brand-400/40 transition-colors"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/55 font-semibold mb-1">
                    {doc.brand} · {doc.type}
                  </p>
                  <h4 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">
                    {doc.title}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-white transition-colors">
                    Open in library <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href="/resources?sort=date-desc"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white transition-colors"
              >
                View all recent documents <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
