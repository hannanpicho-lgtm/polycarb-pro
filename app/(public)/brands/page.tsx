import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package } from 'lucide-react';
import { brands, products } from '@/lib/data';
import { filterByPublicProductVisibility, getPublicHiddenProductSlugs } from '@/lib/public-catalog';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Our Brands',
  description:
    'Explore our partner polycarbonate brands including Covestro, SABIC, Trinseo, Teijin, Mitsubishi, and LG Chem.',
};

const categoryLabels: Record<string, string> = {
  sheets: 'Sheets',
  rods: 'Rods',
  resins: 'Resins',
  specialty: 'Specialty',
};

const categoryColors: Record<string, string> = {
  sheets:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900',
  rods: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800',
  resins:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900',
  specialty:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900',
};

// Brand-specific color configurations with authentic brand colors
const brandColors = {
  covestro: {
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    logoGlow: 'shadow-lg shadow-blue-200 dark:shadow-blue-900/50',
  },
  sabic: {
    accent: 'text-red-600 dark:text-red-400',
    bg: 'from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    logoGlow: 'shadow-lg shadow-red-200 dark:shadow-red-900/50',
  },
  trinseo: {
    accent: 'text-blue-700 dark:text-blue-300',
    bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    logoGlow: 'shadow-lg shadow-blue-200 dark:shadow-blue-900/50',
  },
  teijin: {
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    logoGlow: 'shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50',
  },
  mitsubishi: {
    accent: 'text-red-700 dark:text-red-300',
    bg: 'from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    logoGlow: 'shadow-lg shadow-red-200 dark:shadow-red-900/50',
  },
  lgnci: {
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    logoGlow: 'shadow-lg shadow-orange-200 dark:shadow-orange-900/50',
  },
} as const;

export default async function BrandsPage() {
  const hidden = await getPublicHiddenProductSlugs();
  const brandStats = brands.map((brand) => {
    const brandProducts = filterByPublicProductVisibility(
      products.filter((p) => p.brand === brand.name),
      hidden
    );
    const categories = Array.from(new Set(brandProducts.map((p) => p.category)));
    const inStockCount = brandProducts.filter((p) => p.inStock).length;
    return { brand, productCount: brandProducts.length, categories, inStockCount };
  });

  return (
    <>
      <div className="bg-gradient-to-b from-steel-950 via-steel-950 to-slate-900 pt-28 pb-16">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
            Authorised Distributor Network
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 font-display">
            Premium Polycarbonate Partners
          </h1>
          <p className="text-white/70 text-base max-w-3xl leading-relaxed">
            We partner directly with the world's leading high-performance polymer producers. Each
            brand brings decades of material science excellence, vertical integration, and
            uncompromising quality standards. Your application deserves the best.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-b from-background via-background to-slate-50/50 dark:from-background dark:via-background dark:to-slate-950/30 py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandStats.map(({ brand, productCount, categories, inStockCount }) => {
              type BrandKey = keyof typeof brandColors;
              const defaultColors = brandColors['covestro'];
              const colors =
                (brand.id as BrandKey) in brandColors
                  ? brandColors[brand.id as BrandKey]
                  : defaultColors;

              return (
                <article
                  key={brand.id}
                  className={`group relative bg-card border border-border rounded-2xl p-0 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-slate-900/50 transition-all duration-300 flex flex-col overflow-hidden hover:border-opacity-50 backdrop-blur-sm`}
                >
                  {/* Background gradient based on brand */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-60 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                  />

                  {/* Accent top bar */}
                  <div
                    className={`h-1 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="p-6 flex flex-col h-full">
                    {/* Logo and Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Logo container with brand-specific glow */}
                      <div
                        className={`w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-white/80 dark:bg-slate-900 border border-border flex items-center justify-center ${colors.logoGlow} group-hover:scale-105 transition-transform duration-300`}
                      >
                        {brand.logo ? (
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className={`text-xl font-bold ${colors.accent}`}>
                            {brand.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2
                          className={`font-bold text-sm text-foreground truncate ${colors.accent}`}
                        >
                          {brand.name}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                          {brand.country}
                        </p>
                      </div>
                    </div>

                    {/* Product count badge */}
                    {productCount > 0 && (
                      <div className="inline-flex items-center gap-1.5 mb-4 w-fit">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${colors.accent} bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border rounded-full px-2.5 py-1 whitespace-nowrap`}
                        >
                          <Package className="h-3 w-3" />
                          {productCount} grade{productCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                      {brand.description}
                    </p>

                    {(brand.flagshipSeries || brand.leadTime) && (
                      <div className="mb-4 space-y-1">
                        {brand.flagshipSeries && (
                          <p className="text-[11px] font-semibold text-foreground/80">
                            Flagship: {brand.flagshipSeries}
                          </p>
                        )}
                        {brand.leadTime && (
                          <p className="text-[11px] text-muted-foreground">
                            Typical lead time: {brand.leadTime}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Category coverage or grade list */}
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {categories.map((cat) => (
                          <span
                            key={cat}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${categoryColors[cat] ?? 'bg-muted text-muted-foreground border-border'}`}
                          >
                            {categoryLabels[cat] ?? cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {brand.grades.slice(0, 3).map((grade) => (
                          <span
                            key={grade}
                            className="text-[10px] bg-white/30 dark:bg-slate-800/30 text-foreground/70 px-2 py-0.5 rounded-md font-mono border border-white/20 dark:border-slate-700/20"
                          >
                            {grade}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer with stock status and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 dark:border-slate-700/20">
                      <span className="text-[11px] font-semibold">
                        {inStockCount > 0 ? (
                          <span className={`inline-flex items-center gap-1 ${colors.accent}`}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                            {inStockCount} in stock
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Available to order</span>
                        )}
                      </span>

                      {productCount > 0 && (
                        <Link
                          href={`/products?brand=${encodeURIComponent(brand.name)}`}
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${colors.accent} hover:gap-2 transition-all opacity-0 group-hover:opacity-100`}
                        >
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Premium CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-10 text-center relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10" />

            <h2 className="text-2xl font-bold text-white mb-3">Ready to Explore?</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Need guidance on which brand and grade is right for your application? Our technical
              team combines material science expertise with decades of industry experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                className="bg-white text-brand-600 hover:bg-slate-100 font-semibold px-8 h-11"
              >
                <Link href="/contact?source=brands-cta">Request Consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8 h-11"
              >
                <Link href="/products">Browse All Grades</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
