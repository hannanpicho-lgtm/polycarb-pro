import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { FeaturedProducts } from '@/components/featured-products';
import { getHomepagePublicFeaturedProducts } from '@/lib/public-catalog';
import { SpectacularGallery } from '@/components/spectacular-gallery';
import { StrengthCallout } from '@/components/strength-callout';
import { VisualProofStrip } from '@/components/visual-proof-strip';
import { CinematicBand } from '@/components/cinematic-band';
import { BlogTeaser } from '@/components/blog-teaser';
import { DatasheetSpotlight } from '@/components/datasheet-spotlight';
import { NewsletterStrip } from '@/components/newsletter-strip';
import { FilterSection } from '@/components/filter-section';
import { SocialProof } from '@/components/social-proof';
import { OrganizationJsonLd } from '@/components/json-ld';
import { siteConfig } from '@/lib/site-config';
import { spectacularGallerySelectionDiagnostics } from '@/lib/data';

export const revalidate = 60;

export const metadata: Metadata = {
  title: siteConfig.seo.defaultTitle,
  description:
    'World-class distributor of SABIC Lexan, Covestro Makrolon, and Trinseo Calibre polycarbonate materials. Sheets, rods, resins, and specialty grades for automotive, construction, medical, and electronics.',
};

export default async function HomePage() {
  const featured = await getHomepagePublicFeaturedProducts(3);
  if (process.env.NODE_ENV !== 'production') {
    const {
      reservedSourceCount,
      selectedSourceCount,
      totalCuratedSourceCount,
      selectedReservedOverlapCount,
      fallbackSelectionCount,
      spotlightFallbackCount,
      tiltFallbackCount,
      tiltCategoryMismatchCount,
      marqueeRecycleCount,
      marqueeShortfallCount,
      marqueeDuplicateSourceCount,
      selectionDiversityRatio,
      marqueeUniquenessRatio,
      reservedSourceRatio,
      selectedSourceRatio,
      availableSourceRatio,
      marqueeRowOverlapRatio,
      categoryCoverageRatio,
      missingSelectedCategories,
      alertFlags,
      activeAlertCount,
      degradedAlertCount,
      watchAlertCount,
      severityScore,
      severityBand,
      topAlertKeys,
      alertSummary,
      triageHint,
      snapshotKey,
      healthStatus,
    } = spectacularGallerySelectionDiagnostics;

    const activeAlerts = Object.entries(alertFlags)
      .filter(([, isActive]) => isActive)
      .map(([key]) => key)
      .join(',');

    console.log(
      `[Gallery] status=${healthStatus} severity=${severityBand}:${severityScore} curated=${totalCuratedSourceCount} reserved=${reservedSourceCount} selected=${selectedSourceCount} available=${totalCuratedSourceCount - reservedSourceCount} overlap=${selectedReservedOverlapCount} fallback=${fallbackSelectionCount} spotlightFallback=${spotlightFallbackCount} tiltFallback=${tiltFallbackCount} tiltMismatch=${tiltCategoryMismatchCount} marqueeRecycle=${marqueeRecycleCount} marqueeShortfall=${marqueeShortfallCount} marqueeDupes=${marqueeDuplicateSourceCount} diversity=${selectionDiversityRatio} marqueeUniqueness=${marqueeUniquenessRatio} reservedRatio=${reservedSourceRatio} selectedRatio=${selectedSourceRatio} availableRatio=${availableSourceRatio} rowOverlapRatio=${marqueeRowOverlapRatio} categoryCoverageRatio=${categoryCoverageRatio} missingCategories=${missingSelectedCategories.length} activeAlerts=${activeAlertCount} degradedAlerts=${degradedAlertCount} watchAlerts=${watchAlertCount} topAlerts=${topAlertKeys.join(',') || 'none'} alerts=${activeAlerts || 'none'}`
    );
    console.log(`[Gallery] summary=${alertSummary}`);
    console.log(`[Gallery] triageHint=${triageHint}`);
    console.log(`[Gallery] snapshot=${snapshotKey}`);
  }

  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <FilterSection />
      <VisualProofStrip />
      <StrengthCallout />
      <FeaturedProducts products={featured} />
      <SocialProof />
      <DatasheetSpotlight />
      <CinematicBand />
      <SpectacularGallery />
      <BlogTeaser />
      <NewsletterStrip />

      {/* Bottom conversion strip – matching Covestro CQ solutions promo */}
      <section className="relative py-0 overflow-hidden">
        <div className="relative h-80 lg:h-96 bg-steel-900 flex items-center">
          {/* Background gradient accent */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-900/80 via-steel-950/60 to-steel-900"
            aria-hidden="true"
          />
          <div className="container mx-auto relative z-10">
            <div className="max-w-lg">
              <span className="tag-pill bg-brand-500 text-white mb-4 inline-block">
                ADVISORY SERVICE
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4 font-display">
                CQ Technical Advisory
              </h2>
              <p className="text-white/70 text-[15px] leading-relaxed mb-7">
                A dedicated applications engineer reviews your material selection, processing
                conditions, and quality data — included with every programme. No extra cost.
              </p>
              <a
                href="/contact?source=home-cq-advisory-strip"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded transition-colors text-sm"
              >
                Learn More
              </a>
            </div>
          </div>
          {/* Decorative circle */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-2 border-brand-500/20 hidden lg:block"
            aria-hidden="true"
          />
          <div
            className="absolute right-20 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-brand-500/30 hidden lg:block"
            aria-hidden="true"
          />
        </div>
      </section>
    </>
  );
}
