export type ProductCategory = 'sheets' | 'rods' | 'resins' | 'specialty';
export type ProductIndustry =
  | 'automotive'
  | 'construction'
  | 'medical'
  | 'electronics'
  | 'optical'
  | 'safety'
  | 'agriculture'
  | 'consumer';

export interface ProductSpec {
  density?: string;
  tensileStrength?: string;
  flexuralModulus?: string;
  impactStrength?: string;
  heatDeflection?: string;
  lightTransmittance?: string;
  flamabilityRating?: string;
  thicknessRange?: string;
  dimensions?: string;
  meltFlowIndex?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  grade: string;
  category: ProductCategory;
  subtype: string;
  shortDescription: string;
  description: string;
  applications: string[];
  industries: ProductIndustry[];
  features: string[];
  specifications: ProductSpec;
  certifications: string[];
  inStock: boolean;
  featured: boolean;
  tags: string[];
  image: string;
  datasheetUrl?: string;
  promo?: {
    text: string;
    benefits: string[];
    testimonial?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface Application {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  products: string[];
  benefits: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  country: string;
  description: string;
  grades: string[];
  specialties?: string[];
  flagshipSeries?: string;
  leadTime?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: ProductIndustry;
  quote: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  publishedAt: string;
  readTime: number;
}

export interface HomepageVisualProofPanel {
  src: string;
  alt: string;
  label: string;
  href: string;
}

export interface HomepageHeroSlide {
  tag: string;
  headline: string;
  subheadline: string;
  cta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  bgClass: string;
  image: string;
  video?: string;
  videoWebm?: string;
  videoPoster?: string;
}

export interface DatasheetDocument {
  id: string;
  title: string;
  url: string;
  brand: string;
  publishedAt: string;
  type: 'Primary Datasheet' | 'Technical Note' | 'Compliance Guide' | 'Brochure';
  materialFamily: 'Polycarbonate' | 'Engineering Plastics';
  relatedProductSlugs: string[];
}

const brandCatalogueByBrand: Record<string, string | undefined> = {
  SABIC: '/datasheets/InnovationSolution-mobility_tcm1010-44811.pdf',
  Covestro: '/datasheets/Covestro-Makrolon-2458-Distributor.pdf',
  Trinseo: '/datasheets/Trinseo-Calibre-2061-2060-Brochure.pdf',
  Teijin: '/datasheets/teijin datasheet EU_Filament_overview.pdf',
  'Mitsubishi Engineering Plastics': '/datasheets/Mitsubishi-Iupilon-UL-Yellow-Card-Guide.pdf',
  'LG Chem': '/datasheets/LG-Lupoy-PC-1201-10-Distributor.pdf',
  'Covestro PC': undefined,
};

const productCatalogueBySlug: Record<string, string | undefined> = {
  'makrolon-2407-solid-sheet': '/datasheets/Covestro-Makrolon-2458-Distributor.pdf',
  'lexan-thermoclear-multiwall': '/datasheets/InnovationSolution-mobility_tcm1010-44811.pdf',
  'sabic-lexan-940-resin': '/datasheets/InnovationSolution-mobility_tcm1010-44811.pdf',
  'makrolon-gf30-glass-filled': '/datasheets/Covestro-Makrolon-2458-Distributor.pdf',
  'calibre-ep5030-fr-resin': '/datasheets/Trinseo-Calibre-2061-2060-Brochure.pdf',
  'panlite-l1225-medical-grade': '/datasheets/teijin datasheet EU_Filament_overview.pdf',
  'iupilon-h3000-high-heat': '/datasheets/Mitsubishi-Iupilon-UL-Yellow-Card-Guide.pdf',
  'pc-solid-rod-natural': undefined,
  'lupoy-gp1000m-general-purpose': '/datasheets/LG-Lupoy-PC-1201-10-Distributor.pdf',
  'lexan-exl-pc-siloxane-copolymer': '/datasheets/InnovationSolution-mobility_tcm1010-44811.pdf',
};

function getBrandCatalogueUrl(brand: string): string | undefined {
  return brandCatalogueByBrand[brand];
}

function getProductCatalogueUrl(slug: string, brand: string): string | undefined {
  return productCatalogueBySlug[slug] ?? getBrandCatalogueUrl(brand);
}

export const datasheetLibrary: DatasheetDocument[] = [
  {
    id: 'ds-covestro-makrolon-2458',
    title: 'Covestro Makrolon 2458 Distributor Datasheet',
    url: '/datasheets/Covestro-Makrolon-2458-Distributor.pdf',
    brand: 'Covestro',
    publishedAt: '2026-04-10',
    type: 'Primary Datasheet',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: ['makrolon-2407-solid-sheet', 'makrolon-gf30-glass-filled'],
  },
  {
    id: 'ds-sabic-mobility',
    title: 'SABIC Innovation Solutions Mobility Guide',
    url: '/datasheets/InnovationSolution-mobility_tcm1010-44811.pdf',
    brand: 'SABIC',
    publishedAt: '2026-04-08',
    type: 'Brochure',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: [
      'lexan-thermoclear-multiwall',
      'sabic-lexan-940-resin',
      'lexan-exl-pc-siloxane-copolymer',
    ],
  },
  {
    id: 'ds-lg-lupoy-1201-10',
    title: 'LG Chem Lupoy PC 1201-10 Datasheet',
    url: '/datasheets/LG-Lupoy-PC-1201-10-Distributor.pdf',
    brand: 'LG Chem',
    publishedAt: '2026-04-14',
    type: 'Primary Datasheet',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: ['lupoy-gp1000m-general-purpose'],
  },
  {
    id: 'ds-mitsubishi-iupilon-ul',
    title: 'Mitsubishi Iupilon UL Yellow Card Guide',
    url: '/datasheets/Mitsubishi-Iupilon-UL-Yellow-Card-Guide.pdf',
    brand: 'Mitsubishi Engineering Plastics',
    publishedAt: '2026-04-07',
    type: 'Compliance Guide',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: ['iupilon-h3000-high-heat'],
  },
  {
    id: 'ds-teijin-filament-overview',
    title: 'Teijin Filament Overview (EU)',
    url: '/datasheets/teijin datasheet EU_Filament_overview.pdf',
    brand: 'Teijin',
    publishedAt: '2026-04-09',
    type: 'Brochure',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: ['panlite-l1225-medical-grade'],
  },
  {
    id: 'ds-teijin-carbon-handling',
    title: 'Teijin Carbon Filament Handling Information',
    url: '/datasheets/2023-09_TeijinCarbon_Handling_Information_Filament_Yarn.pdf',
    brand: 'Teijin',
    publishedAt: '2026-04-12',
    type: 'Technical Note',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: ['panlite-l1225-medical-grade'],
  },
  {
    id: 'ds-teijin-note-1',
    title: 'Teijin Technical Datasheet 1',
    url: '/datasheets/teijin1.pdf',
    brand: 'Teijin',
    publishedAt: '2026-04-15',
    type: 'Technical Note',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: ['panlite-l1225-medical-grade'],
  },
  {
    id: 'ds-teijin-note-2',
    title: 'Teijin Technical Datasheet 2',
    url: '/datasheets/teijin2.pdf',
    brand: 'Teijin',
    publishedAt: '2026-04-15',
    type: 'Technical Note',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: ['panlite-l1225-medical-grade'],
  },
  {
    id: 'ds-teijin-note-3',
    title: 'Teijin Technical Datasheet 3',
    url: '/datasheets/teijin3.pdf',
    brand: 'Teijin',
    publishedAt: '2026-04-15',
    type: 'Technical Note',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: ['panlite-l1225-medical-grade'],
  },
  {
    id: 'ds-trinseo-calibre-brochure',
    title: 'Trinseo Calibre 2061/2060 Brochure',
    url: '/datasheets/Trinseo-Calibre-2061-2060-Brochure.pdf',
    brand: 'Trinseo',
    publishedAt: '2026-04-06',
    type: 'Brochure',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: ['calibre-ep5030-fr-resin'],
  },
  {
    id: 'ds-trinseo-medical-fact-sheet',
    title: 'Trinseo High-Flow Medical PC Fact Sheet',
    url: '/datasheets/Trinseo-High-Flow-Medical-PC-Fact-Sheet.pdf',
    brand: 'Trinseo',
    publishedAt: '2026-04-13',
    type: 'Technical Note',
    materialFamily: 'Polycarbonate',
    relatedProductSlugs: ['calibre-ep5030-fr-resin'],
  },
  {
    id: 'ds-aep-duratron-u2100',
    title: 'AEP Duratron U2100 PEI Datasheet',
    url: '/datasheets/AEP-Duratron™ U2100 PEI_en_US.pdf',
    brand: 'AEP',
    publishedAt: '2026-04-11',
    type: 'Primary Datasheet',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: [],
  },
  {
    id: 'ds-aep-fluorosint-135',
    title: 'AEP Fluorosint 135 PTFE Datasheet',
    url: '/datasheets/AEP-Fluorosint™ 135 PTFE_en_US.pdf',
    brand: 'AEP',
    publishedAt: '2026-04-11',
    type: 'Primary Datasheet',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: [],
  },
  {
    id: 'ds-pe-500-hmw',
    title: 'PE 500 HMW-PE Datasheet',
    url: '/datasheets/PE-PE 500 HMW-PE_en_US.pdf',
    brand: 'PE',
    publishedAt: '2026-04-14',
    type: 'Primary Datasheet',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: [],
  },
  {
    id: 'ds-proteus-hdpe',
    title: 'Proteus HDPE Datasheet',
    url: '/datasheets/PE-Proteus™ HDPE_en_US.pdf',
    brand: 'Proteus',
    publishedAt: '2026-04-14',
    type: 'Primary Datasheet',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: [],
  },
  {
    id: 'ds-proteus-pp-natural',
    title: 'Proteus Homopolymer PP Natural Datasheet',
    url: '/datasheets/PE-Proteus™ Homopolymer PP Natural_en_US.pdf',
    brand: 'Proteus',
    publishedAt: '2026-04-14',
    type: 'Primary Datasheet',
    materialFamily: 'Engineering Plastics',
    relatedProductSlugs: [],
  },
];

export type GalleryCategory =
  | 'automotive'
  | 'architecture'
  | 'canopy'
  | 'industrial'
  | 'medical'
  | 'materials';

export type GalleryComposition = 'wide' | 'detail' | 'product' | 'material';

export interface GalleryImage {
  src: string;
  alt: string;
  category: GalleryCategory;
  composition: GalleryComposition;
}

export interface GalleryShowcaseCard {
  src: string;
  alt: string;
  label: string;
  href: string;
}

export interface SpectacularGallerySelectionDiagnostics {
  reservedSourceCount: number;
  selectedSourceCount: number;
  totalCuratedSourceCount: number;
  availableSourceCount: number;
  unusedCuratedSourceCount: number;
  selectedReservedOverlapCount: number;
  marqueeTargetCount: number;
  marqueeRenderedCount: number;
  marqueeShortfallCount: number;
  marqueeUniqueSourceCount: number;
  marqueeDuplicateSourceCount: number;
  fallbackSelectionCount: number;
  spotlightFallbackCount: number;
  tiltFallbackCount: number;
  tiltCategoryMismatchCount: number;
  marqueeRecycleCount: number;
  selectionDiversityRatio: number;
  marqueeUniquenessRatio: number;
  reservedSourceRatio: number;
  selectedSourceRatio: number;
  availableSourceRatio: number;
  marqueeRowOverlapCount: number;
  marqueeRowOverlapRatio: number;
  coverageCategoryCount: number;
  categoryCoverageRatio: number;
  selectedCategoryCoverage: Record<GalleryCategory, number>;
  missingSelectedCategories: GalleryCategory[];
  alertFlags: {
    reservedOverlap: boolean;
    marqueeShortfall: boolean;
    fallbackUsed: boolean;
    duplicatePressure: boolean;
    tiltMismatch: boolean;
    missingCategories: boolean;
    lowDiversity: boolean;
    lowUniqueness: boolean;
    highReservedPressure: boolean;
    rowOverlapHigh: boolean;
    coverageThin: boolean;
  };
  activeAlertCount: number;
  degradedAlertCount: number;
  watchAlertCount: number;
  severityScore: number;
  severityBand: 'ok' | 'elevated' | 'critical';
  topAlertKeys: Array<keyof SpectacularGallerySelectionDiagnostics['alertFlags']>;
  alertSummary: string;
  triageHint: string;
  snapshotKey: string;
  snapshotLine: string;
  healthStatus: 'healthy' | 'watch' | 'degraded';
  healthNotes: string[];
}

const _GALLERY_DIAGNOSTIC_THRESHOLDS = {
  duplicatePressureMin: 2,
  diversityMin: 0.75,
  uniquenessMin: 0.8,
  reservedPressureMin: 0.55,
  rowOverlapHighMin: 0.33,
  categoryCoverageMin: 0.67,
  severityCriticalScoreMin: 55,
} as const;

type PictureMetadataOverride = {
  alt?: string;
  category?: GalleryCategory;
  composition?: GalleryComposition;
};

export const pictureGalleryImages: string[] = [
  '/pictures/2017-bmw-5-series-touring-10.jpg',
  '/pictures/2020-bmw-3-series-revealed-in-stunning-photo-shoot-more-power-on-tap_31.jpg',
  '/pictures/2020_bmw_3-series_sedan_330i_edetail_oem_2_500.avif',
  '/pictures/2021_bmw_7-series_sedan_750i-xdrive_edetail_oem_1_815.avif',
  '/pictures/2e52516cf97da90afb04564c85785e71.jpg',
  '/pictures/360_F_212871297_RSQcXGjTf4l9TObW6231AcKeFrXsp4q7.jpg',
  '/pictures/61bEtUOwyBL._AC_UF1000,1000_QL80_.jpg',
  '/pictures/6a29bd0b725f02fd088df3e079fc8b6b_1737028138.webp',
  '/pictures/ABAF2013-B764-4E6D-9796-21B89EFA1905.jpg',
  '/pictures/BMW-8-Series-Concept-pictures_25-1024x683.jpg',
  '/pictures/BMW-Laser-light-detail-on-G15-8-Series.jpg',
  '/pictures/bmw-laserlights-i8-03.jpg',
  '/pictures/closeup-spools-with-multicolored-plastic-wires-d-printers-1-1024x683.jpg',
  '/pictures/hammond.jpg',
  '/pictures/Materials-for-Consumer-Electronics-Manufacturing-Hero-2048x1366-1-1200x900.jpg',
  '/pictures/PC-plastic-application-in-consumer-electronic.webp',
  '/pictures/polycarbonate-1-1.jpg',
  '/pictures/polycarbonate-enclosure-features.jpg',
  '/pictures/polycarbonate-enclosures-junction-boxes-1000x1000.webp',
  '/pictures/polycarbonate-parts-1024x716.jpg',
  '/pictures/se-bmw-8-series-vert-7.jpg',
  '/pictures/What-is-Polycarbonate.jpg',
  '/pictures/what-are-the-future-trends-for-polycarbonate-in-electronics-3.webp',
  '/pictures/automotive-lightweighting.avif',
  '/pictures/Blade-silver-C6-Corvette-Z06-with-gloss-carbon-flash-and-cyber-grey-stinger-jake-skull-1.jpg',
  '/pictures/automotive-polycarbonate-bonnet-panel.jpg',
  '/pictures/Customizable-Modern-Polycarbonate-Panels-for-Car-Garage-Canopy-Simple-Villa-Garden-Waterproof-Arched-Roof-Car-Parking-Shed.jpg_300x300.avif',
  '/pictures/danpatherm-gallery.jpg',
  '/pictures/display-home-the-allure-ventura-homes-img~d171fd60030303a3_14-0136-1-04d2e99.jpg',
  '/pictures/G05-G06-Front-Hood-FRP-Bonnet-Glass-Fiber-Reinforced-Plastic-LD-Style-for-BMW-X5-G05-X6-G06-2020-Car-Front-Lever-Machine-Cover.avif',
  '/pictures/H52ac87ab6eb64be2ad7c15eeef841e8dF.avif',
  '/pictures/High-Quality-Heat-Treated-Polycarbonate-Roof-Aluminum-Frame-Cantilever-Carport-Garage-Car-Parking-Shed.avif',
  '/pictures/automotive-polycarbonate-side-window.jpg',
  '/pictures/img_0894_rev_rt_mt_hood_1.jpg',
  '/pictures/installed-polycarbonate-window-vent.png',
  '/pictures/istockphoto-686873268-612x612.jpg',
  '/pictures/lexan-roof-panels.webp',
  '/pictures/luxury-balcony-polycarbonate-roof.jpg',
  '/pictures/machine-guard-polycarbonate.webp',
  '/pictures/machine-guard-types.webp',
  '/pictures/medical-polycarbonate-device.jpg',
  '/pictures/polycarbonate-resin-grade.webp',
  '/pictures/polycarbonate-roofing-1.jpg',
  '/pictures/polycarbonate-sheet-panel.webp',
  '/pictures/polycarbonate-windows-canopy.jpg',
  '/pictures/s-l1600 (1).webp',
  '/pictures/s-l1600 (2).webp',
  '/pictures/s-l1600 (3).webp',
  '/pictures/s-l1600 (4).webp',
  '/pictures/s-l1600 (5).webp',
  '/pictures/s-l1600.webp',
  '/pictures/s-l960 (1).webp',
  '/pictures/s-l960 (10).webp',
  '/pictures/s-l960 (11).webp',
  '/pictures/s-l960 (12).webp',
  '/pictures/s-l960 (13).webp',
  '/pictures/s-l960 (14).webp',
  '/pictures/s-l960 (15).webp',
  '/pictures/s-l960 (2).webp',
  '/pictures/s-l960 (3).webp',
  '/pictures/s-l960 (4).webp',
  '/pictures/s-l960 (5).webp',
  '/pictures/s-l960 (6).webp',
  '/pictures/s-l960 (7).webp',
  '/pictures/s-l960 (8).webp',
  '/pictures/s-l960 (9).webp',
  '/pictures/s-l960.webp',
  '/pictures/sunpal-banner.jpg',
  '/pictures/terrace-behind-house-made-beams-260nw-2665798029.webp',
  '/pictures/terrace-behind-house-made-beams-260nw-2665808521.webp',
  '/pictures/terrace-behind-house-made-beams-260nw-2666112465.webp',
];

const pictureMetadataOverrides: Partial<Record<string, PictureMetadataOverride>> = {
  '/pictures/2021_bmw_7-series_sedan_750i-xdrive_edetail_oem_1_815.avif': {
    alt: 'BMW 7 Series exterior wide shot for automotive polycarbonate inspiration',
    composition: 'wide',
  },
  '/pictures/BMW-Laser-light-detail-on-G15-8-Series.jpg': {
    alt: 'BMW laser headlamp detail illustrating optical polycarbonate performance',
    composition: 'detail',
  },
  '/pictures/medical-polycarbonate-device.jpg': {
    alt: 'Medical device close-up using medical-grade polycarbonate housing',
    category: 'medical',
    composition: 'detail',
  },
  '/pictures/PH2_Group.webp': {
    alt: 'Medical workflow scene with polycarbonate-compatible clinical equipment',
    category: 'medical',
    composition: 'wide',
  },
  '/pictures/polycarbonate-1-1.jpg': {
    alt: 'Raw polycarbonate material close-up reference',
    category: 'materials',
    composition: 'material',
  },
  '/pictures/What-is-Polycarbonate.jpg': {
    alt: 'Polycarbonate material explainer visual',
    category: 'materials',
    composition: 'material',
  },
  '/pictures/polycarbonate-enclosure-features.jpg': {
    alt: 'Consumer enclosure feature detail using polycarbonate components',
    category: 'industrial',
    composition: 'detail',
  },
  '/pictures/terrace-behind-house-made-beams-260nw-2666112465.webp': {
    alt: 'Wide terrace canopy installation with polycarbonate roofing',
    category: 'canopy',
    composition: 'wide',
  },
};

function inferGalleryCategory(src: string): GalleryCategory {
  const override = pictureMetadataOverrides[src];
  if (override?.category) return override.category;

  const value = src.toLowerCase();
  if (/(automotive|civic|bmw|mercedes|corvette|bonnet|hood|car)/.test(value)) return 'automotive';
  if (/(medical|device)/.test(value)) return 'medical';
  if (/(electronic|electronics|enclosure|hammond|pcb)/.test(value)) return 'industrial';
  if (/(guard|window|vent|machine|industrial)/.test(value)) return 'industrial';
  if (/(roof|canopy|balcony|terrace|patio|sunpal|danpatherm|installed)/.test(value))
    return 'canopy';
  if (/(sheet|resin|material|spools|polycarbonate-1|what-is-polycarbonate|l1600|l960)/.test(value))
    return 'materials';
  return 'architecture';
}

function inferGalleryComposition(src: string): GalleryComposition {
  const override = pictureMetadataOverrides[src];
  if (override?.composition) return override.composition;

  const value = src.toLowerCase();
  if (/(laser|detail|device|feature|vent|hood|bonnet|closeup)/.test(value)) return 'detail';
  if (/(spools|material|resin|sheet|polycarbonate-1|what-is-polycarbonate|l1600|l960)/.test(value))
    return 'material';
  if (/(enclosure|parts|hammond|electronic|guard|roofing)/.test(value)) return 'product';
  return 'wide';
}

function createGalleryAlt(src: string): string {
  const override = pictureMetadataOverrides[src];
  if (override?.alt) {
    return override.alt;
  }

  const fileName = src.split('/').pop() ?? src;
  const cleaned = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_~]+/g, ' ')
    .replace(/\s+\(\d+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${cleaned} polycarbonate reference image`;
}

export const pictureGalleryItems: GalleryImage[] = pictureGalleryImages.map((src) => ({
  src,
  alt: createGalleryAlt(src),
  category: inferGalleryCategory(src),
  composition: inferGalleryComposition(src),
}));

function scoreGalleryTransition(
  previous: GalleryImage | undefined,
  candidate: GalleryImage,
  index: number
) {
  let score = 0;

  if (!previous) {
    if (candidate.composition === 'wide') score += 4;
    if (candidate.category === 'automotive' || candidate.category === 'architecture') score += 2;
    return score;
  }

  if (candidate.category !== previous.category) score += 3;
  if (candidate.composition !== previous.composition) score += 4;
  if (candidate.composition === 'wide' && previous.composition !== 'wide') score += 1;
  if (candidate.composition === 'material' && previous.composition === 'wide') score += 1;
  score -= index * 0.01;

  return score;
}

function balanceGalleryItems(items: GalleryImage[]) {
  const remaining = [...items];
  const ordered: GalleryImage[] = [];

  while (remaining.length > 0) {
    const previous = ordered[ordered.length - 1];
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index]!;
      const score = scoreGalleryTransition(previous, candidate, index);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    ordered.push(remaining.splice(bestIndex, 1)[0]!);
  }

  return ordered;
}

export const curatedPictureGalleryItems: GalleryImage[] = balanceGalleryItems(pictureGalleryItems);

function _findGalleryImage(
  images: GalleryImage[],
  used: Set<string>,
  predicate: (image: GalleryImage) => boolean
) {
  const match = images.find((image) => !used.has(image.src) && predicate(image));
  if (match) {
    used.add(match.src);
  }
  return match;
}

function _fallbackGalleryImage(
  images: GalleryImage[],
  used: Set<string>,
  predicate?: (image: GalleryImage) => boolean
) {
  const firstImage = images[0];
  if (!firstImage) {
    throw new Error('Expected at least one curated gallery image for showcase selection.');
  }

  // Priority 1: unused image matching predicate
  // Priority 2: unused image ignoring predicate (avoids reserved overlap)
  // Priority 3: any image matching predicate (last resort, may repeat)
  // Priority 4: first image (absolute last resort)
  const fallback =
    images.find((image) => !used.has(image.src) && (!predicate || predicate(image))) ??
    images.find((image) => !used.has(image.src)) ??
    images.find((image) => !predicate || predicate(image)) ??
    firstImage;

  if (!used.has(fallback.src)) {
    used.add(fallback.src);
  }

  return fallback;
}

function galleryLabelAndHref(category: GalleryCategory): { label: string; href: string } {
  switch (category) {
    case 'automotive':
      return { label: 'Automotive', href: '/applications/automotive' };
    case 'medical':
      return { label: 'Medical', href: '/applications/medical' };
    case 'industrial':
      return { label: 'Industrial', href: '/products?industry=electronics' };
    case 'canopy':
      return { label: 'Canopies', href: '/applications/construction' };
    case 'materials':
      return { label: 'Materials', href: '/products?category=resins' };
    case 'architecture':
    default:
      return { label: 'Architecture', href: '/applications/construction' };
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: '1',
    slug: 'makrolon-2407-solid-sheet',
    name: 'Makrolon® 2407 Solid PC Sheet',
    brand: 'Covestro',
    grade: 'Makrolon 2407',
    category: 'sheets',
    subtype: 'Solid Sheet',
    shortDescription: 'General-purpose optically clear polycarbonate sheet with UV protection.',
    description:
      'Makrolon® 2407 is a high-quality, optically transparent polycarbonate sheet delivering outstanding impact resistance and long-term UV stability. Ideal for architectural glazing, safety barriers, and display applications. The co-extruded UV-protective layer ensures exceptional weathering performance with minimal yellowing over time.',
    applications: [
      'Architectural glazing',
      'Safety barriers',
      'Signage',
      'Machine guards',
      'Display panels',
    ],
    industries: ['construction', 'safety', 'consumer'],
    features: [
      '250× more impact resistant than glass',
      'UV-protective co-extruded layer',
      '90% light transmittance',
      'Halogen-free flame retardant option',
      'Thermoformable & cold-bendable',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '63 MPa',
      flexuralModulus: '2,350 MPa',
      impactStrength: 'No break (Notched Izod)',
      heatDeflection: '128 °C',
      lightTransmittance: '90%',
      thicknessRange: '1 mm – 25 mm',
      dimensions: '2,050 × 3,050 mm (standard)',
    },
    certifications: ['ISO 9001', 'UL 94 V-2', 'CE Marked', 'RoHS'],
    inStock: true,
    featured: true,
    tags: ['clear', 'UV-stable', 'glazing', 'architectural'],
    image: '/pictures/polycarbonate-windows-canopy.jpg',
    datasheetUrl: getProductCatalogueUrl('makrolon-2407-solid-sheet', 'Covestro'),
  },
  {
    id: '2',
    slug: 'lexan-thermoclear-multiwall',
    name: 'LEXAN™ Thermoclear® Multiwall Sheet',
    brand: 'SABIC',
    grade: 'Thermoclear 2UV',
    category: 'sheets',
    subtype: 'Multiwall Sheet',
    shortDescription:
      'Lightweight multiwall PC sheet with superior thermal insulation for roofing & facades.',
    description:
      'LEXAN™ Thermoclear® multiwall polycarbonate sheets offer excellent thermal insulation combined with high light transmission. The twin or multi-wall structure creates air chambers that reduce heat transfer, making it ideal for greenhouse, patio roofing, and curtain wall systems. Both sides protected with UV co-extrusion.',
    applications: ['Greenhouse panels', 'Patio roofing', 'Skylights', 'Curtain walls', 'Carports'],
    industries: ['construction', 'agriculture'],
    features: [
      'Dual-side UV protection',
      'Up to 80% weight savings vs. glass',
      'U-value as low as 1.1 W/m²K',
      '50-year expected service life',
      'Available in multiple colors & tints',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '55 MPa',
      heatDeflection: '120 °C',
      lightTransmittance: '40–82% (depending on configuration)',
      thicknessRange: '4 mm – 40 mm (twin to 5-wall)',
      dimensions: '2,100 × 6,000 mm (standard)',
      flamabilityRating: 'UL 94 HB',
    },
    certifications: ['ISO 9001', 'ASTM D3679', 'CE Marked'],
    inStock: true,
    featured: true,
    tags: ['multiwall', 'insulation', 'roofing', 'greenhouse'],
    image: '/pictures/lexan-roof-panels.webp',
    datasheetUrl: getProductCatalogueUrl('lexan-thermoclear-multiwall', 'SABIC'),
  },
  {
    id: '3',
    slug: 'sabic-lexan-940-resin',
    name: 'SABIC® LEXAN™ 940 Resin',
    brand: 'SABIC',
    grade: 'LEXAN 940',
    category: 'resins',
    subtype: 'Injection Molding Grade',
    shortDescription: 'High-flow optical-grade PC resin for precision injection molded parts.',
    description:
      'LEXAN™ 940 is a premium optical-grade polycarbonate resin engineered for precision injection molding of lenses, light guides, and optical components. Its exceptional clarity, tight molecular-weight distribution, and excellent flow properties allow for complex thin-wall geometries with minimal residual stress.',
    applications: [
      'Headlamp lenses',
      'Light guides',
      'Optical diffusers',
      'CD/DVD substrates',
      'Medical optics',
    ],
    industries: ['automotive', 'optical', 'medical', 'electronics'],
    features: [
      '>92% light transmittance',
      'Low birefringence',
      'Excellent dimensional stability',
      'High purity, low contamination',
      'FDA-compliant grade available',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '65 MPa',
      flexuralModulus: '2,400 MPa',
      meltFlowIndex: '10 g/10 min (300 °C / 1.2 kg)',
      heatDeflection: '130 °C',
      lightTransmittance: '92%',
    },
    certifications: ['ISO 9001', 'UL 94 HB', 'FDA 21 CFR (select grades)'],
    inStock: true,
    featured: true,
    tags: ['optical', 'resin', 'injection-molding', 'high-clarity'],
    image: '/pictures/polycarbonate-resin-grade.webp',
    datasheetUrl: getProductCatalogueUrl('sabic-lexan-940-resin', 'SABIC'),
  },
  {
    id: '4',
    slug: 'makrolon-gf30-glass-filled',
    name: 'Makrolon® GF30 Glass-Filled PC Resin',
    brand: 'Covestro',
    grade: 'Makrolon GF30',
    category: 'specialty',
    subtype: 'Glass-Filled Compound',
    shortDescription: '30% glass-fiber reinforced PC for high-stiffness structural components.',
    description:
      'Makrolon® GF30 is a 30% glass-fiber reinforced polycarbonate compound delivering dramatically enhanced stiffness and reduced thermal expansion. Ideal for precision-engineered structural components in automotive underhood environments, electrical housings, and industrial equipment where dimensional stability under heat is critical.',
    applications: [
      'Automotive brackets',
      'Electrical housings',
      'Structural panels',
      'Industrial frames',
      'Power-tool bodies',
    ],
    industries: ['automotive', 'electronics'],
    features: [
      '3× stiffness of unfilled PC',
      'Reduced CLTE vs. unfilled grades',
      'Excellent surface quality',
      'Weld-line strength retention',
      'Heat-stabilized formulation',
    ],
    specifications: {
      density: '1.43 g/cm³',
      tensileStrength: '100 MPa',
      flexuralModulus: '7,200 MPa',
      heatDeflection: '150 °C',
      meltFlowIndex: '6 g/10 min (300 °C / 1.2 kg)',
    },
    certifications: ['ISO 9001', 'UL 94 V-0', 'REACH Compliant'],
    inStock: true,
    featured: false,
    tags: ['glass-filled', 'structural', 'high-stiffness', 'specialty'],
    image: '/pictures/polycarbonate-sheet-panel.webp',
    datasheetUrl: getProductCatalogueUrl('makrolon-gf30-glass-filled', 'Covestro'),
  },
  {
    id: '5',
    slug: 'calibre-ep5030-fr-resin',
    name: 'Calibre™ EP5030 FR PC Resin',
    brand: 'Trinseo',
    grade: 'Calibre EP5030',
    category: 'resins',
    subtype: 'Flame Retardant Grade',
    shortDescription:
      'UL 94 V-0 rated PC resin for demanding electronic & electrical applications.',
    description:
      'Calibre™ EP5030 is a halogen-free, UL 94 V-0 rated polycarbonate resin offering outstanding flame retardancy without compromising mechanical performance. Formulated for thin-wall electrical enclosures, EV battery housings, and consumer electronics where strict fire safety standards apply.',
    applications: [
      'Electrical enclosures',
      'EV battery housings',
      'PCB supports',
      'Consumer electronics',
      'Appliance components',
    ],
    industries: ['electronics', 'automotive', 'consumer'],
    features: [
      'UL 94 V-0 at 1.0 mm',
      'Halogen-free, phosphorus-based FR',
      'Glow-wire certified',
      'RoHS & REACH compliant',
      'Good impact retention at FR loadings',
    ],
    specifications: {
      density: '1.26 g/cm³',
      tensileStrength: '58 MPa',
      flexuralModulus: '2,300 MPa',
      impactStrength: '40 kJ/m²',
      heatDeflection: '118 °C',
      flamabilityRating: 'UL 94 V-0 (1.0 mm)',
    },
    certifications: ['UL 94 V-0', 'REACH', 'RoHS 2', 'ISO 9001'],
    inStock: true,
    featured: false,
    tags: ['flame-retardant', 'V-0', 'halogen-free', 'electronics'],
    image: '/pictures/polycarbonate-enclosures-junction-boxes-1000x1000.webp',
    datasheetUrl: getProductCatalogueUrl('calibre-ep5030-fr-resin', 'Trinseo'),
  },
  {
    id: '6',
    slug: 'panlite-l1225-medical-grade',
    name: 'Panlite® L-1225 Medical Grade',
    brand: 'Teijin',
    grade: 'Panlite L-1225',
    category: 'resins',
    subtype: 'Medical Grade',
    shortDescription: 'ISO 10993 bio-compatible PC resin for medical devices & diagnostics.',
    description:
      'Panlite® L-1225 is a biocompatible polycarbonate resin meeting ISO 10993 cytotoxicity requirements. Designed for medical diagnostic housings, filtration components, surgical instruments, and single-use assemblies. Gamma-radiation stable option available. Manufactured under ISO 13485-certified conditions.',
    applications: [
      'Diagnostic housings',
      'Surgical instruments',
      'IV connectors',
      'Filtration membranes',
      'Specimen containers',
    ],
    industries: ['medical'],
    features: [
      'ISO 10993 biocompatibility',
      'Gamma & EtO sterilization compatible',
      'High purity, batch traceability',
      'Excellent hydrolytic stability',
      'ISO 13485 manufacturing',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      flexuralModulus: '2,300 MPa',
      heatDeflection: '129 °C',
      meltFlowIndex: '22 g/10 min (300 °C / 1.2 kg)',
    },
    certifications: ['ISO 10993', 'ISO 13485', 'USP Class VI', 'FDA DMF'],
    inStock: true,
    featured: true,
    tags: ['medical', 'biocompatible', 'ISO-10993', 'sterilizable'],
    image: '/pictures/medical-polycarbonate-device.jpg',
    datasheetUrl: getProductCatalogueUrl('panlite-l1225-medical-grade', 'Teijin'),
  },
  {
    id: '7',
    slug: 'iupilon-h3000-high-heat',
    name: 'Iupilon® H-3000 High Heat PC',
    brand: 'Mitsubishi Engineering Plastics',
    grade: 'Iupilon H-3000',
    category: 'specialty',
    subtype: 'High Heat Grade',
    shortDescription: 'PDO copolymer PC resin with HDT >160 °C for demanding thermal environments.',
    description:
      "Iupilon® H-3000 is a high-heat polycarbonate copolymer based on PDO (1,1-bis(4-hydroxyphenyl)-3,3,5-trimethylcyclohexane) offering a heat deflection temperature exceeding 160 °C while maintaining PC's signature toughness and optical clarity.",
    applications: [
      'LED reflectors',
      'Automotive lamps',
      'High-current connectors',
      'Under-hood sensors',
    ],
    industries: ['automotive', 'electronics', 'optical'],
    features: [
      'HDT >160 °C (0.45 MPa)',
      'Minimal colour shift at elevated temperatures',
      'Compatible with standard PC processing',
      'High surface gloss',
    ],
    specifications: {
      density: '1.21 g/cm³',
      tensileStrength: '66 MPa',
      heatDeflection: '163 °C',
      flexuralModulus: '2,500 MPa',
      meltFlowIndex: '8 g/10 min (330 °C / 1.2 kg)',
    },
    certifications: ['ISO 9001', 'UL 94 V-2', 'REACH'],
    inStock: false,
    featured: false,
    tags: ['high-heat', 'copolymer', 'automotive', 'PDO'],
    image: '/pictures/bmw-laserlights-i8-03.jpg',
    datasheetUrl: getProductCatalogueUrl(
      'iupilon-h3000-high-heat',
      'Mitsubishi Engineering Plastics'
    ),
  },
  {
    id: '8',
    slug: 'pc-solid-rod-natural',
    name: 'PC Extruded Rod – Natural (Clear)',
    brand: 'Covestro PC',
    grade: 'PCR-NAT',
    category: 'rods',
    subtype: 'Extruded Rod',
    shortDescription: 'Clear, impact-resistant polycarbonate rods for machined components.',
    description:
      'Our PCR-NAT extruded polycarbonate rods are manufactured from virgin general-purpose PC resin and are machined to precision tolerances. Ideal for bearing bushings, sight gauges, prototyping, and structural spacers. Available in diameters 6 mm – 200 mm in standard 1 m or 2 m lengths.',
    applications: [
      'Bearing bushings',
      'Spacers',
      'Sight gauges',
      'Prototypes',
      'Structural components',
    ],
    industries: ['construction', 'electronics', 'consumer'],
    features: [
      'Virgin GP PC material',
      'Tight diameter tolerances (±0.2 mm)',
      'Easily machinable – drills, mills, turns',
      'Optically clear',
      'Custom lengths on request',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '127 °C',
      thicknessRange: 'Ø 6 mm – Ø 200 mm',
    },
    certifications: ['RoHS', 'REACH'],
    inStock: true,
    featured: false,
    tags: ['rod', 'clear', 'machinable', 'extruded'],
    image: '/pictures/polycarbonate-parts-1024x716.jpg',
    datasheetUrl: getProductCatalogueUrl('pc-solid-rod-natural', 'Covestro PC'),
  },
  {
    id: '9',
    slug: 'lupoy-gp1000m-general-purpose',
    name: 'Lupoy® GP1000M General Purpose PC',
    brand: 'LG Chem',
    grade: 'Lupoy GP1000M',
    category: 'resins',
    subtype: 'General Purpose Grade',
    shortDescription:
      'Transparent general-purpose PC resin for consumer electronics and appliance housings.',
    description:
      'Lupoy® GP1000M is a versatile, optically clear general-purpose polycarbonate resin from LG Chem offering a balanced combination of transparency, impact resistance, and processability. Its consistent melt flow and tight specification control make it a reliable choice for injection-molded consumer electronics, appliance covers, and protective housings. Complies with major regulatory requirements including RoHS and REACH.',
    applications: [
      'Appliance housings',
      'Consumer electronics covers',
      'Lighting diffusers',
      'Display panels',
      'Protective shields',
    ],
    industries: ['consumer', 'electronics'],
    features: [
      '89% light transmittance',
      'Balanced stiffness–toughness profile',
      'Consistent melt flow across lots',
      'RoHS & REACH compliant',
      'Easy colorability',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '60 MPa',
      flexuralModulus: '2,350 MPa',
      impactStrength: 'No break (Notched Izod, 3.2 mm)',
      heatDeflection: '130 °C',
      lightTransmittance: '89%',
      meltFlowIndex: '10 g/10 min (300 °C / 1.2 kg)',
    },
    certifications: ['UL 94 HB', 'RoHS', 'REACH', 'ISO 9001'],
    inStock: true,
    featured: false,
    tags: ['general-purpose', 'transparent', 'consumer', 'appliance'],
    image:
      '/pictures/Materials-for-Consumer-Electronics-Manufacturing-Hero-2048x1366-1-1200x900.jpg',
    datasheetUrl: getProductCatalogueUrl('lupoy-gp1000m-general-purpose', 'LG Chem'),
  },
  {
    id: '10',
    slug: 'lexan-exl-pc-siloxane-copolymer',
    name: 'LEXAN™ EXL PC-Siloxane Copolymer',
    brand: 'SABIC',
    grade: 'LEXAN EXL',
    category: 'specialty',
    subtype: 'PC-Siloxane Copolymer',
    shortDescription:
      'High-impact PC-siloxane copolymer retaining toughness down to –40 °C for automotive & outdoor use.',
    description:
      'LEXAN™ EXL is a PC-siloxane block copolymer engineered to deliver exceptional ductile impact performance at sub-zero temperatures — maintaining no-break Notched Izod values down to –40 °C where standard PC grades become brittle. The siloxane blocks also improve chemical resistance and paint adhesion without requiring primers, making it the material of choice for automotive exterior cladding, safety helmets, and outdoor enclosure systems.',
    applications: [
      'Automotive exterior panels',
      'Bumper fascias',
      'Safety helmets',
      'Outdoor electrical enclosures',
      'Cold-climate glazing',
    ],
    industries: ['automotive', 'safety', 'construction'],
    features: [
      'No-break Izod impact at –40 °C',
      'Direct metallizing & paint adhesion',
      'CLTE comparable to standard PC',
      'ASTM D3763 high-rate impact certified',
      'Available flame-retardant (V-0) variant',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '55 MPa',
      flexuralModulus: '2,100 MPa',
      impactStrength: 'No break at –40 °C (Notched Izod)',
      heatDeflection: '120 °C',
      meltFlowIndex: '6 g/10 min (300 °C / 1.2 kg)',
      flamabilityRating: 'UL 94 V-2 (standard); V-0 variant available',
    },
    certifications: ['ISO 9001', 'UL 94 V-2', 'REACH', 'ASTM D3763'],
    inStock: true,
    featured: false,
    tags: ['copolymer', 'low-temperature', 'automotive', 'impact'],
    image: '/pictures/BMW-8-Series-Concept-pictures_25-1024x683.jpg',
    datasheetUrl: getProductCatalogueUrl('lexan-exl-pc-siloxane-copolymer', 'SABIC'),
  },
  // ─── Additional Sheet Products ───────────────────────────────────────────
  {
    id: '11',
    slug: 'makrolon-2805-solar-control-sheet',
    name: 'Makrolon® 2805 Solar Control Sheet',
    brand: 'Covestro',
    grade: 'Makrolon 2805',
    category: 'sheets',
    subtype: 'UV/IR Filtering Sheet',
    shortDescription: 'Advanced solar control sheet absorbing 99% IR for reduced glare and heat.',
    description:
      'Makrolon® 2805 provides intelligent energy management through infrared absorption, maintaining visual clarity while cutting solar heat gain by up to 60%. Perfect for automotive sunroofs, architectural skylights, and conservatories.',
    applications: ['Automotive sunroofs', 'Skylights', 'Conservatory glazing', 'Display windows'],
    industries: ['automotive', 'construction', 'consumer'],
    features: [
      '99% IR absorption',
      'High light transmittance',
      'Reduces glare',
      'Energy-efficient',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      lightTransmittance: '75%',
      heatDeflection: '127 °C',
    },
    certifications: ['ISO 9001', 'CE Marked'],
    inStock: true,
    featured: true,
    tags: ['solar-control', 'UV-filtering', 'energy-efficient'],
    image: '/pictures/luxury-balcony-polycarbonate-roof.jpg',
    datasheetUrl: getProductCatalogueUrl('makrolon-2805-solar-control-sheet', 'Covestro'),
    promo: {
      text: '20% Off Solar Control – Cut Energy Costs 60%',
      benefits: [
        'Absorbs 99% of infrared radiation',
        'Maintains 75% light transmittance for visibility',
        'Reduces air-conditioning costs up to 40%',
        'Proven in automotive OEM applications',
      ],
      testimonial:
        'Installing Makrolon 2805 in our conservatory reduced summer cooling costs dramatically while keeping the space bright and comfortable.',
      ctaText: 'Calculate Your Savings',
      ctaLink: '/contact',
    },
  },
  {
    id: '12',
    slug: 'lexan-lx-polycarbonate-sheet',
    name: 'LEXAN™ LX Polycarbonate Sheet',
    brand: 'SABIC',
    grade: 'LEXAN LX',
    category: 'sheets',
    subtype: 'Premium Solid Sheet',
    shortDescription: 'Premium solid sheet with superior surface finish and high gloss properties.',
    description:
      'LEXAN™ LX combines optical clarity with an exceptionally smooth surface finish for applications requiring premium aesthetics. Post-formable and highly resistant to yellowing even in harsh UV environments.',
    applications: ['Display windows', 'Premium signage', 'Light diffusers', 'Protective barriers'],
    industries: ['construction', 'consumer'],
    features: ['High gloss finish', 'Premium clarity', 'UV stable', 'Post-formable'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '63 MPa',
      lightTransmittance: '92%',
      heatDeflection: '128 °C',
    },
    certifications: ['ISO 9001', 'UL 94 V-2'],
    inStock: true,
    featured: false,
    tags: ['premium', 'clear', 'glossy', 'aesthetic'],
    image: '/pictures/polycarbonate-roofing-1.jpg',
    datasheetUrl: getProductCatalogueUrl('lexan-lx-polycarbonate-sheet', 'SABIC'),
  },
  {
    id: '13',
    slug: 'calibre-solid-sheet-natural',
    name: 'Calibre™ Solid Sheet – Natural',
    brand: 'Trinseo',
    grade: 'Calibre SN',
    category: 'sheets',
    subtype: 'General Purpose Sheet',
    shortDescription: 'Versatile general-purpose PC sheet for diverse glazing applications.',
    description:
      'Calibre™ natural solid sheet delivers reliable performance across architectural and industrial glazing, protective barriers, and light-diffusion applications. Excellent balance of cost and performance.',
    applications: [
      'Architectural glazing',
      'Machine guards',
      'Safety barriers',
      'Protective covers',
    ],
    industries: ['construction', 'safety'],
    features: ['Cost-effective', 'Impact resistant', 'UV protected', 'Easy to thermoform'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      lightTransmittance: '88%',
      heatDeflection: '127 °C',
    },
    certifications: ['ISO 9001', 'RoHS'],
    inStock: true,
    featured: false,
    tags: ['general-purpose', 'cost-effective', 'versatile'],
    image: '/pictures/danpatherm-gallery.jpg',
    datasheetUrl: getProductCatalogueUrl('calibre-solid-sheet-natural', 'Trinseo'),
  },
  {
    id: '14',
    slug: 'panlite-twinwall-sheet',
    name: 'Panlite® Twinwall Polycarbonate Sheet',
    brand: 'Teijin',
    grade: 'Panlite TW',
    category: 'sheets',
    subtype: 'Twinwall Sheet',
    shortDescription:
      'Lightweight twinwall sheet offering superior thermal insulation for roofing applications.',
    description:
      'Panlite® twinwall combines the lightweight construction of multiwall sheets with thermal efficiency, making it ideal for greenhouses, conservatories, and industrial skylights.',
    applications: ['Greenhouse panels', 'Industrial skylights', 'Conservatory roofing', 'Pergolas'],
    industries: ['construction', 'agriculture'],
    features: ['Thermal insulation', 'Lightweight', 'Dual UV protection', 'Long-lasting'],
    specifications: {
      density: '1.18 g/cm³',
      tensileStrength: '52 MPa',
      lightTransmittance: '82%',
      thicknessRange: '6–12 mm',
    },
    certifications: ['ISO 9001', 'CE Marked'],
    inStock: true,
    featured: false,
    tags: ['twinwall', 'insulation', 'lightweight'],
    image: '/pictures/sunpal-banner.jpg',
    datasheetUrl: getProductCatalogueUrl('panlite-twinwall-sheet', 'Teijin'),
  },
  {
    id: '15',
    slug: 'iupilon-pc-sheet-architectural',
    name: 'Iupilon® PC Sheet – Architectural',
    brand: 'Mitsubishi Engineering Plastics',
    grade: 'Iupilon AS',
    category: 'sheets',
    subtype: 'Architectural Sheet',
    shortDescription:
      'Architectural-grade PC sheet combining clarity with durability for facade applications.',
    description:
      'Iupilon® architectural sheet delivers superior durability and aesthetics for building envelopes, interior partitions, and design-forward glazing systems.',
    applications: ['Facade glazing', 'Interior partitions', 'Design panels', 'Atrium glazing'],
    industries: ['construction'],
    features: ['Design freedom', 'High durability', 'Excellent clarity', 'Integrated functions'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      lightTransmittance: '90%',
      heatDeflection: '130 °C',
    },
    certifications: ['ISO 9001', 'REACH'],
    inStock: true,
    featured: true,
    tags: ['architectural', 'facade', 'design'],
    image: '/pictures/terrace-behind-house-made-beams-260nw-2665808521.webp',
    datasheetUrl: getProductCatalogueUrl(
      'iupilon-pc-sheet-architectural',
      'Mitsubishi Engineering Plastics'
    ),
  },
  {
    id: '16',
    slug: 'lupoy-pc-sheet-clear',
    name: 'Lupoy® PC Sheet – Clear',
    brand: 'LG Chem',
    grade: 'Lupoy SH',
    category: 'sheets',
    subtype: 'Solid Sheet',
    shortDescription: 'Crystal-clear solid PC sheet for premium glazing and display applications.',
    description:
      'Lupoy® clear solid sheet combines optical clarity with excellent impact resistance, offering a superior alternative to glass for high-performance glazing requirements.',
    applications: ['Display windows', 'Premium glazing', 'Light diffusers', 'Protective barriers'],
    industries: ['construction', 'consumer'],
    features: ['Crystal clear', 'Impact resistant', 'UV stable', 'Post-formable'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      lightTransmittance: '90%',
      heatDeflection: '127 °C',
    },
    certifications: ['ISO 9001', 'RoHS'],
    inStock: true,
    featured: false,
    tags: ['clear', 'display', 'premium'],
    image: '/pictures/installed-polycarbonate-window-vent.png',
    datasheetUrl: getProductCatalogueUrl('lupoy-pc-sheet-clear', 'LG Chem'),
  },
  // ─── Additional Rod Products ────────────────────────────────────────────
  {
    id: '17',
    slug: 'pc-extruded-rod-smoke-tinted',
    name: 'PC Extruded Rod – Smoke Tinted',
    brand: 'Covestro PC',
    grade: 'PCR-SMK',
    category: 'rods',
    subtype: 'Smoke Tinted Rod',
    shortDescription: 'Smoke-tinted extruded PC rods for aesthetic and functional applications.',
    description:
      'Smoke-tinted PC rods combine light filtering capability with mechanical strength. Ideal for decorative applications, light diffusion, and privacy screens.',
    applications: [
      'Decorative elements',
      'Light diffusers',
      'Privacy screens',
      'Design components',
    ],
    industries: ['construction', 'consumer'],
    features: ['Aesthetic appeal', 'Light filtering', 'Machinable', 'Durable'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '127 °C',
      thicknessRange: 'Ø 6 – 200 mm',
    },
    certifications: ['RoHS'],
    inStock: true,
    featured: false,
    tags: ['tinted', 'decorative', 'rod'],
    image: '/pictures/s-l960 (1).webp',
    datasheetUrl: getProductCatalogueUrl('pc-extruded-rod-smoke-tinted', 'Covestro PC'),
  },
  {
    id: '18',
    slug: 'lexan-rod-acrylic-polycarbonate',
    name: 'LEXAN™ Rod – Acrylic Co-extruded',
    brand: 'SABIC',
    grade: 'LEXAN Rod AX',
    category: 'rods',
    subtype: 'Coextruded Rod',
    shortDescription:
      'Polycarbonate rod with an acrylic co-extruded surface for superior scratch resistance.',
    description:
      'LEXAN™ coextruded rods combine PC toughness with an acrylic hard-coat surface layer, delivering scratch resistance and optical clarity in demanding applications.',
    applications: ['Sight glasses', 'Protective tubes', 'Decorative items', 'Technical components'],
    industries: ['automotive', 'electronics'],
    features: ['Scratch-resistant', 'Tough core', 'Optical clarity', 'Precision machined'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '127 °C',
      thicknessRange: 'Ø 8 – 150 mm',
    },
    certifications: ['ISO 9001'],
    inStock: false,
    featured: false,
    tags: ['coextruded', 'scratch-resistant', 'rod'],
    image: '/pictures/s-l960 (2).webp',
    datasheetUrl: getProductCatalogueUrl('lexan-rod-acrylic-polycarbonate', 'SABIC'),
  },
  {
    id: '19',
    slug: 'calibre-pc-tube-natural',
    name: 'Calibre™ PC Tube – Natural Clear',
    brand: 'Trinseo',
    grade: 'Calibre Tube NC',
    category: 'rods',
    subtype: 'Extruded Tube',
    shortDescription:
      'Heat-shrinkable and standard extruded PC tubes for engineering and design applications.',
    description:
      'Calibre™ PC tubes offer consistent wall thickness and dimensional stability for pressure vessels, protective sleeves, and industrial components.',
    applications: [
      'Protective sleeves',
      'Fluid containers',
      'Engineering components',
      'Decorative tubes',
    ],
    industries: ['electronics', 'consumer'],
    features: ['Precise dimensions', 'Chemically resistant', 'Easy to customize', 'Durable'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '60 MPa',
      heatDeflection: '127 °C',
      thicknessRange: 'ID 4 – 100 mm',
    },
    certifications: ['ISO 9001'],
    inStock: true,
    featured: false,
    tags: ['tube', 'extruded', 'engineering'],
    image: '/pictures/s-l960 (3).webp',
    datasheetUrl: getProductCatalogueUrl('calibre-pc-tube-natural', 'Trinseo'),
  },
  {
    id: '20',
    slug: 'panlite-rod-medical-grade',
    name: 'Panlite® Rod – Medical Grade',
    brand: 'Teijin',
    grade: 'Panlite Rod MD',
    category: 'rods',
    subtype: 'Medical Grade Rod',
    shortDescription: 'ISO 10993 biocompatible PC rods for medical device machining.',
    description:
      'Panlite® medical-grade PC rods offer biocompatibility, sterilization stability, and precision machinability for custom medical components and surgical instruments.',
    applications: [
      'Surgical instrument components',
      'Medical device housings',
      'Diagnostic probe shafts',
      'Biomedical structures',
    ],
    industries: ['medical'],
    features: [
      'ISO 10993 compliant',
      'Sterilization stable',
      'Precise machining',
      'Batch traceability',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '129 °C',
      thicknessRange: 'Ø 6 – 100 mm',
    },
    certifications: ['ISO 10993', 'ISO 13485', 'FDA'],
    inStock: true,
    featured: true,
    tags: ['medical', 'biocompatible', 'rod'],
    image: '/pictures/s-l960 (6).webp',
    datasheetUrl: getProductCatalogueUrl('panlite-rod-medical-grade', 'Teijin'),
  },
  {
    id: '21',
    slug: 'iupilon-rod-heat-resistant',
    name: 'Iupilon® Rod – High Heat Resistant',
    brand: 'Mitsubishi Engineering Plastics',
    grade: 'Iupilon Rod HH',
    category: 'rods',
    subtype: 'High-Temperature Rod',
    shortDescription: 'High-heat PC rods maintaining toughness at temperatures up to 160 °C.',
    description:
      'Iupilon® high-heat rods retain impact resistance and dimensional stability in thermal environments, ideal for automotive underhood and industrial high-temperature applications.',
    applications: [
      'Automotive engine components',
      'Thermal sensor housings',
      'High-temperature bearings',
      'Industrial connectors',
    ],
    industries: ['automotive', 'electronics'],
    features: [
      '160+ °C capability',
      'Impact resistant',
      'Dimensional stability',
      'Precision machined',
    ],
    specifications: {
      density: '1.21 g/cm³',
      tensileStrength: '66 MPa',
      heatDeflection: '163 °C',
      thicknessRange: 'Ø 6 – 150 mm',
    },
    certifications: ['ISO 9001', 'REACH'],
    inStock: false,
    featured: false,
    tags: ['high-temperature', 'heat-resistant', 'rod'],
    image: '/pictures/s-l960 (4).webp',
    datasheetUrl: getProductCatalogueUrl(
      'iupilon-rod-heat-resistant',
      'Mitsubishi Engineering Plastics'
    ),
  },
  {
    id: '22',
    slug: 'lupoy-rod-transparent',
    name: 'Lupoy® Rod – Transparent',
    brand: 'LG Chem',
    grade: 'Lupoy Rod TR',
    category: 'rods',
    subtype: 'Transparent Rod',
    shortDescription: 'Crystal-clear PC rods for optical and aesthetic applications.',
    description:
      'Lupoy® transparent rods combine exceptional optical clarity with mechanical toughness, suitable for sight glasses, light guides, and precision components.',
    applications: ['Sight glasses', 'Light guides', 'Optical components', 'Protective covers'],
    industries: ['automotive', 'optical'],
    features: ['Crystal clear', 'Impact tough', 'Machinable', 'Precision tolerances'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '130 °C',
      thicknessRange: 'Ø 6 – 200 mm',
    },
    certifications: ['ISO 9001', 'RoHS'],
    inStock: true,
    featured: true,
    tags: ['transparent', 'optical', 'rod'],
    image: '/pictures/s-l960 (5).webp',
    datasheetUrl: getProductCatalogueUrl('lupoy-rod-transparent', 'LG Chem'),
  },
  {
    id: '23',
    slug: 'pc-plate-thick-section',
    name: 'PC Plate – Thick Section Extruded',
    brand: 'Covestro PC',
    grade: 'PCR-THICK',
    category: 'rods',
    subtype: 'Thick Section Plate',
    shortDescription: 'Extruded PC plates up to 100 mm thick for structural bearing applications.',
    description:
      'Thick-section PC plates offer superior strength and rigidity for load-bearing structures, structural spacers, and precision machined components.',
    applications: ['Bearing blocks', 'Structural spacers', 'Machine bases', 'Precision mounts'],
    industries: ['construction', 'consumer'],
    features: ['Thick sections available', 'Structural strength', 'Machinable', 'Durable'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '127 °C',
      thicknessRange: '10 – 100 mm',
    },
    certifications: ['RoHS', 'ISO 9001'],
    inStock: false,
    featured: false,
    tags: ['thick-section', 'structural', 'plate'],
    image: '/pictures/s-l1600.webp',
    datasheetUrl: getProductCatalogueUrl('pc-plate-thick-section', 'Covestro PC'),
  },
  // ─── Additional Resin Products ─────────────────────────────────────────
  {
    id: '24',
    slug: 'covestro-makrolon-ar1000-antireflective',
    name: 'Makrolon® AR1000 Anti-Reflective Resin',
    brand: 'Covestro',
    grade: 'Makrolon AR1000',
    category: 'resins',
    subtype: 'Optical Specialty Grade',
    shortDescription: 'Optical-grade resin engineered for anti-reflective coating compatibility.',
    description:
      'Makrolon® AR1000 is formulated for precision optical molding with superior anti-reflective coating adhesion, ideal for camera lenses and precision optical instruments.',
    applications: ['Camera lenses', 'Optical instruments', 'Precision optics', 'Display screens'],
    industries: ['optical', 'electronics', 'consumer'],
    features: [
      'AR coating compatible',
      'Optical clarity',
      'Low birefringence',
      'Precision moldable',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '65 MPa',
      lightTransmittance: '92%',
      meltFlowIndex: '10 g/10 min',
    },
    certifications: ['ISO 9001'],
    inStock: true,
    featured: true,
    tags: ['optical', 'anti-reflective', 'resin'],
    image: '/pictures/BMW-Laser-light-detail-on-G15-8-Series.jpg',
    datasheetUrl: getProductCatalogueUrl('covestro-makrolon-ar1000-antireflective', 'Covestro'),
  },
  {
    id: '25',
    slug: 'sabic-lexan-fp-food-contact',
    name: 'LEXAN™ FP – Food-Contact Resin',
    brand: 'SABIC',
    grade: 'LEXAN FP',
    category: 'resins',
    subtype: 'Food-Safe Grade',
    shortDescription: 'Food-contact compliant PC resin for beverage and food-service containers.',
    description:
      'LEXAN™ FP is specifically formulated to meet FDA 21 CFR 177.1580 food-contact requirements, ideal for reusable beverage containers, microwave-safe dishes, and food-service items.',
    applications: [
      'Reusable beverage bottles',
      'Food storage containers',
      'Microwave-safe dishes',
      'Food-service items',
    ],
    industries: ['consumer'],
    features: ['BPA-free', 'FDA compliant', 'Microwave stable', 'Dishwasher safe'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '60 MPa',
      heatDeflection: '130 °C',
      meltFlowIndex: '12 g/10 min',
    },
    certifications: ['FDA 21 CFR 177.1580', 'NSF', 'ISO 9001'],
    inStock: true,
    featured: true,
    tags: ['food-safe', 'FDA', 'resin'],
    image: '/pictures/PC-plastic-application-in-consumer-electronic.webp',
    datasheetUrl: getProductCatalogueUrl('sabic-lexan-fp-food-contact', 'SABIC'),
  },
  {
    id: '26',
    slug: 'trinseo-calibre-2100-transparent',
    name: 'Calibre™ 2100 Transparent Resin',
    brand: 'Trinseo',
    grade: 'Calibre 2100',
    category: 'resins',
    subtype: 'Transparent Premium Grade',
    shortDescription:
      'High-transparency PC resin for premium consumer goods and optical applications.',
    description:
      'Calibre™ 2100 delivers exceptional optical clarity and minimal flow lines, making it ideal for transparent housings, light covers, and precision optical molding.',
    applications: [
      'Transparent housings',
      'Light covers',
      'Optical components',
      'Premium consumer goods',
    ],
    industries: ['electronics', 'consumer', 'optical'],
    features: ['High transparency', 'Minimal flow lines', 'Premium clarity', 'Surface gloss'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '61 MPa',
      lightTransmittance: '91%',
      meltFlowIndex: '9 g/10 min',
    },
    certifications: ['UL 94 HB', 'ISO 9001'],
    inStock: true,
    featured: false,
    tags: ['transparent', 'optical', 'premium'],
    image: '/pictures/closeup-spools-with-multicolored-plastic-wires-d-printers-1-1024x683.jpg',
    datasheetUrl: getProductCatalogueUrl('trinseo-calibre-2100-transparent', 'Trinseo'),
  },
  {
    id: '27',
    slug: 'lg-chem-lupoy-fr-flame-retardant',
    name: 'Lupoy® FR Flame-Retardant Resin',
    brand: 'LG Chem',
    grade: 'Lupoy FR',
    category: 'resins',
    subtype: 'Halogen-Free FR Grade',
    shortDescription: 'UL 94 V-0 rated halogen-free PC resin for safety-critical applications.',
    description:
      'Lupoy® FR offers excellent flame retardancy without halogens, meeting stringent flammability standards for electronic enclosures and consumer safety products.',
    applications: [
      'Electrical enclosures',
      'Safety equipment',
      'Consumer electronics',
      'Appliance housings',
    ],
    industries: ['electronics', 'consumer', 'safety'],
    features: ['UL 94 V-0', 'Halogen-free', 'Safety certified', 'Reliable FR performance'],
    specifications: {
      density: '1.22 g/cm³',
      tensileStrength: '59 MPa',
      heatDeflection: '125 °C',
      flamabilityRating: 'UL 94 V-0',
    },
    certifications: ['UL 94 V-0', 'RoHS', 'REACH'],
    inStock: true,
    featured: true,
    tags: ['flame-retardant', 'halogen-free', 'safety'],
    image: '/pictures/machine-guard-polycarbonate.webp',
    datasheetUrl: getProductCatalogueUrl('lg-chem-lupoy-fr-flame-retardant', 'LG Chem'),
  },
  // ─── Additional Specialty Products ──────────────────────────────────────
  {
    id: '28',
    slug: 'teijin-panlite-uv-resistant-specialty',
    name: 'Panlite® UV-Resistant Specialty Compound',
    brand: 'Teijin',
    grade: 'Panlite UV+',
    category: 'specialty',
    subtype: 'UV-Stabilized Compound',
    shortDescription: 'Advanced UV-stabilized PC compound for long-term outdoor applications.',
    description:
      'Panlite® UV+ combines exceptional UV stability with the toughness of polycarbonate, engineered for outdoor equipment, agricultural structures, and long-life protective barriers.',
    applications: [
      'Outdoor barriers',
      'Agricultural equipment',
      'Long-life covers',
      'Environmental housings',
    ],
    industries: ['agriculture', 'construction'],
    features: ['Extended UV stability', 'Outdoor-rated', 'Excellent toughness', 'Color stable'],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '130 °C' },
    certifications: ['ISO 9001', 'REACH'],
    inStock: true,
    featured: false,
    tags: ['UV-resistant', 'outdoor', 'specialty'],
    image: '/pictures/terrace-behind-house-made-beams-260nw-2665798029.webp',
    datasheetUrl: getProductCatalogueUrl('teijin-panlite-uv-resistant-specialty', 'Teijin'),
  },
  {
    id: '29',
    slug: 'mitsubishi-iupilon-fire-rated-specialty',
    name: 'Iupilon® Fire-Rated Specialty Grade',
    brand: 'Mitsubishi Engineering Plastics',
    grade: 'Iupilon FR+',
    category: 'specialty',
    subtype: 'Fire-Rated Compound',
    shortDescription:
      'Premium fire-rated PC compound for high-safety applications requiring both FR and impact performance.',
    description:
      'Iupilon® FR+ combines UL 94 V-0 flame retardancy with exceptional impact resistance, meeting the most demanding safety requirements in construction and transportation.',
    applications: [
      'Building panels',
      'Transit components',
      'Safety enclosures',
      'Fire-resistant barriers',
    ],
    industries: ['construction', 'safety'],
    features: ['UL 94 V-0', 'High impact', 'Fire resistant', 'Premium FR'],
    specifications: {
      density: '1.25 g/cm³',
      tensileStrength: '65 MPa',
      heatDeflection: '140 °C',
      flamabilityRating: 'UL 94 V-0',
    },
    certifications: ['UL 94 V-0', 'REACH', 'ISO 9001'],
    inStock: true,
    featured: false,
    tags: ['fire-rated', 'V-0', 'safety'],
    image: '/pictures/automotive-lightweighting.avif',
    datasheetUrl: getProductCatalogueUrl(
      'mitsubishi-iupilon-fire-rated-specialty',
      'Mitsubishi Engineering Plastics'
    ),
  },
  {
    id: '30',
    slug: 'covestro-makrolon-esd-electrostatic',
    name: 'Makrolon® ESD Electrostatic Dissipative',
    brand: 'Covestro',
    grade: 'Makrolon ESD',
    category: 'specialty',
    subtype: 'ESD-Safe Compound',
    shortDescription:
      'Electrostatically dissipative (ESD) PC compound protecting sensitive electronics.',
    description:
      'Makrolon® ESD is engineered to safely dissipate static charges, protecting sensitive electronic components during manufacturing and handling. Essential for semiconductor and precision instrument applications.',
    applications: [
      'ESD-safe equipment',
      'Semiconductor protection',
      'Electronics enclosures',
      'Precision instrument housings',
    ],
    industries: ['electronics'],
    features: [
      'ESD-safe (10⁶–10⁹ Ω)',
      'Static dissipative',
      'Component protection',
      'Safe handling',
    ],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '127 °C' },
    certifications: ['ESD-SAC 11.11', 'ISO 9001'],
    inStock: true,
    featured: true,
    tags: ['ESD', 'electrostatic', 'electronics'],
    image: '/pictures/hammond.jpg',
    datasheetUrl: getProductCatalogueUrl('covestro-makrolon-esd-electrostatic', 'Covestro'),
    promo: {
      text: 'Save 25% – ESD Protection Your Semiconductors Deserve',
      benefits: [
        'ESD-SAC 11.11 certified for safe dissipation',
        'Stable conductivity (10⁶–10⁹ Ω) across lifecycle',
        'Tested for zero component failures',
        'Batch documentation included',
      ],
      testimonial:
        'Makrolon ESD has become our standard for all semiconductor packaging. The consistency and certification eliminated our ESD-related defect costs entirely.',
      ctaText: 'Request ESD Test Report',
      ctaLink: '/contact',
    },
  },
  {
    id: '31',
    slug: 'lexan-ballistic-resistant-compound',
    name: 'LEXAN™ Ballistic Resistant Compound',
    brand: 'SABIC',
    grade: 'LEXAN BR',
    category: 'specialty',
    subtype: 'Ballistic Grade',
    shortDescription:
      'Premium ballistic-resistant PC compound for security and protection applications.',
    description:
      'LEXAN™ BR is a specialized polycarbonate formulation engineered to meet NIJ ballistic protection standards, delivering transparent armor solutions for security applications.',
    applications: [
      'Ballistic protection panels',
      'Security glazing',
      'Protective barriers',
      'Armored enclosures',
    ],
    industries: ['safety'],
    features: ['NIJ rated', 'Ballistic protection', 'Transparent armor', 'Impact resistant'],
    specifications: {
      density: '1.22 g/cm³',
      tensileStrength: '68 MPa',
      impactStrength: 'Ballistic rated',
      heatDeflection: '135 °C',
    },
    certifications: ['NIJ', 'ISO 9001', 'EN 356'],
    inStock: false,
    featured: false,
    tags: ['ballistic', 'armor', 'security'],
    image: '/pictures/s-l960 (10).webp',
    datasheetUrl: getProductCatalogueUrl('lexan-ballistic-resistant-compound', 'SABIC'),
  },
  {
    id: '32',
    slug: 'calibre-automotive-underhood-compound',
    name: 'Calibre™ Automotive Underhood Compound',
    brand: 'Trinseo',
    grade: 'Calibre AH',
    category: 'specialty',
    subtype: 'Automotive High-Heat',
    shortDescription:
      'High-temperature PC compound engineered for demanding automotive underhood environments.',
    description:
      'Calibre™ AH is formulated to withstand sustained high-temperature exposure in automotive engine compartments while maintaining impact resistance and dimensional stability.',
    applications: [
      'Engine bay covers',
      'Air intake manifolds',
      'Cooling fan housings',
      'Thermal barriers',
    ],
    industries: ['automotive'],
    features: ['150+ °C continuous', 'Underhood stable', 'High impact', 'Dimension stable'],
    specifications: {
      density: '1.21 g/cm³',
      tensileStrength: '64 MPa',
      heatDeflection: '150 °C',
      meltFlowIndex: '7 g/10 min',
    },
    certifications: ['ISO 9001', 'REACH', 'Automotive standards'],
    inStock: true,
    featured: false,
    tags: ['underhood', 'automotive', 'high-temp'],
    image: '/pictures/2020_bmw_3-series_sedan_330i_edetail_oem_2_500.avif',
    datasheetUrl: getProductCatalogueUrl('calibre-automotive-underhood-compound', 'Trinseo'),
  },
  {
    id: '33',
    slug: 'lupoy-impact-modified-specialty',
    name: 'Lupoy® Impact-Modified Specialty Compound',
    brand: 'LG Chem',
    grade: 'Lupoy IM',
    category: 'specialty',
    subtype: 'Impact-Modified Grade',
    shortDescription:
      'Enhanced impact-modified PC compound for extreme cold-temperature applications.',
    description:
      'Lupoy® IM maintains exceptional toughness even at cryogenic temperatures, making it ideal for cold-climate equipment, freezer components, and arctic-rated applications.',
    applications: [
      'Freezer components',
      'Cold-climate equipment',
      'Arctic applications',
      'Low-temperature enclosures',
    ],
    industries: ['safety', 'consumer'],
    features: ['Cryogenic stable', 'Low-temp tough', 'Impact resistant', 'Reliable at –50 °C'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '60 MPa',
      heatDeflection: '125 °C',
      impactStrength: 'No break at –50 °C',
    },
    certifications: ['ISO 9001', 'REACH'],
    inStock: false,
    featured: false,
    tags: ['impact-modified', 'cold-temperature', 'specialty'],
    image: '/pictures/machine-guard-types.webp',
    datasheetUrl: getProductCatalogueUrl('lupoy-impact-modified-specialty', 'LG Chem'),
  },
  // ─── Medical Device Products ────────────────────────────────────────────
  {
    id: '34',
    slug: 'makrolon-medical-grade-iso-10993',
    name: 'Makrolon® Medical-Grade – ISO 10993',
    brand: 'Covestro',
    grade: 'Makrolon MD',
    category: 'resins',
    subtype: 'Medical Grade',
    shortDescription:
      'ISO 10993-compliant medical-grade PC for surgical instruments and diagnostic devices.',
    description:
      'Makrolon® Medical-Grade combines biocompatibility, sterilization stability (gamma and EtO), and batch traceability required for critical medical applications including surgical implants and diagnostic optics.',
    applications: [
      'Surgical instrument components',
      'Diagnostic imaging housings',
      'Fluid pathway components',
      'Patient interface parts',
    ],
    industries: ['medical'],
    features: [
      'ISO 10993 certified',
      'Gamma & EtO stable',
      'Batch traceable',
      'Dimensional stable',
    ],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '130 °C' },
    certifications: ['ISO 10993-1', 'ISO 10993-5', 'ISO 13485', 'FDA'],
    inStock: true,
    featured: true,
    tags: ['medical', 'biocompatible', 'ISO-10993'],
    image: '/pictures/s-l1600 (1).webp',
    datasheetUrl: getProductCatalogueUrl('makrolon-medical-grade-iso-10993', 'Covestro'),
    promo: {
      text: '15% Off Medical-Grade – FDA Certified',
      benefits: [
        'Batch-traceable for GMP compliance',
        'Dual sterilization stable (EtO + Gamma)',
        'Complete biocompatibility documentation',
        'Expedited samples available',
      ],
      testimonial:
        'Makrolon Medical has become the trusted choice for our surgical implant components. The batch traceability and proven sterilization stability saves us months in validation.',
      ctaText: 'Get Medical Sample Kit',
      ctaLink: '/contact',
    },
  },
  {
    id: '35',
    slug: 'lexan-medical-optical-lens-compound',
    name: 'LEXAN™ Medical Optical – Lens Compound',
    brand: 'SABIC',
    grade: 'LEXAN Medical Optical',
    category: 'resins',
    subtype: 'Medical Optical',
    shortDescription:
      'Medical-grade optical PC for intraocular lenses (IOLs) and ophthalmic devices.',
    description:
      'LEXAN™ Medical Optical meets FDA and ISO 10993 requirements for intraocular lens applications, delivering exceptional optical clarity (<2% haze) combined with biocompatibility.',
    applications: [
      'Intraocular lenses',
      'Ophthalmic sensors',
      'Diagnostic lens assemblies',
      'Ophthalmic devices',
    ],
    industries: ['medical'],
    features: ['<2% haze (optical)', 'IOL-compatible', 'Biocompatible', 'Optically clear'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      lightTransmittance: '92%',
      heatDeflection: '130 °C',
    },
    certifications: ['ISO 10993-1', 'FDA 21 CFR 886.1200', 'ISO 13485'],
    inStock: true,
    featured: true,
    tags: ['medical', 'optical', 'IOL'],
    image: '/pictures/s-l1600 (2).webp',
    datasheetUrl: getProductCatalogueUrl('lexan-medical-optical-lens-compound', 'SABIC'),
  },
  {
    id: '36',
    slug: 'calibre-medical-multiuse-devices',
    name: 'Calibre™ Medical – Multiuse Devices',
    brand: 'Trinseo',
    grade: 'Calibre Medical',
    category: 'resins',
    subtype: 'Medical Device Grade',
    shortDescription:
      'ISO 10993 medical-grade PC for multiuse medical devices and reusable instruments.',
    description:
      'Calibre™ Medical delivers robust sterilization stability (multiple gamma and EtO cycles) and reliable leach resistance, perfect for reusable surgical instruments and devices.',
    applications: [
      'Reusable surgical instruments',
      'Autoclavable device housings',
      'Multi-use diagnostic tools',
      'Sterilizable components',
    ],
    industries: ['medical'],
    features: [
      'Multi-cycle sterilization',
      'ISO 10993 compliant',
      'Leach resistant',
      'Dimensional stable',
    ],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '130 °C' },
    certifications: ['ISO 10993', 'ISO 13485', 'FDA'],
    inStock: true,
    featured: true,
    tags: ['medical', 'multiuse', 'sterilizable'],
    image: '/pictures/s-l1600 (3).webp',
    datasheetUrl: getProductCatalogueUrl('calibre-medical-multiuse-devices', 'Trinseo'),
  },
  {
    id: '37',
    slug: 'panlite-medical-diagnostic-imaging',
    name: 'Panlite® Medical – Diagnostic Imaging',
    brand: 'Teijin',
    grade: 'Panlite Medical DI',
    category: 'resins',
    subtype: 'Medical Imaging Grade',
    shortDescription:
      'Medical-grade PC for ultrasound probe housings and diagnostic imaging device enclosures.',
    description:
      'Panlite® Medical DI is optimized for diagnostic device applications requiring excellent acoustic coupling properties while maintaining full ISO 10993 biocompatibility.',
    applications: [
      'Ultrasound probe housings',
      'Diagnostic scanners',
      'Imaging sensor covers',
      'Medical probe enclosures',
    ],
    industries: ['medical'],
    features: [
      'Acoustic optimized',
      'ISO 10993 compliant',
      'Gamma & EtO stable',
      'Signal transparent',
    ],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '130 °C' },
    certifications: ['ISO 10993-1', 'ISO 13485', 'FDA'],
    inStock: true,
    featured: true,
    tags: ['medical', 'diagnostic', 'imaging'],
    image: '/pictures/s-l1600 (4).webp',
    datasheetUrl: getProductCatalogueUrl('panlite-medical-diagnostic-imaging', 'Teijin'),
  },
  {
    id: '38',
    slug: 'iupilon-medical-fluid-path',
    name: 'Iupilon® Medical – Fluid Path Components',
    brand: 'Mitsubishi Engineering Plastics',
    grade: 'Iupilon Medical FP',
    category: 'resins',
    subtype: 'Medical Fluid Path',
    shortDescription:
      'Medical-grade PC for blood/fluid contact components in diagnostic and therapeutic devices.',
    description:
      'Iupilon® Medical FP meets ISO 10993 blood contactability requirements, ideal for infusion sets, fluid pathways, and blood-contacting analyzer components.',
    applications: [
      'Blood-contacting pathways',
      'Infusion set components',
      'Fluid analyzer cartridges',
      'Therapeutic fluid holders',
    ],
    industries: ['medical'],
    features: ['Blood compatible', 'ISO 10993 certified', 'Low extractables', 'Transparent'],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '130 °C' },
    certifications: ['ISO 10993-1', 'ISO 10993-4', 'ISO 13485', 'FDA'],
    inStock: true,
    featured: false,
    tags: ['medical', 'fluid-path', 'blood-compatible'],
    image: '/pictures/s-l1600 (5).webp',
    datasheetUrl: getProductCatalogueUrl(
      'iupilon-medical-fluid-path',
      'Mitsubishi Engineering Plastics'
    ),
  },
  {
    id: '39',
    slug: 'lupoy-medical-dental-applications',
    name: 'Lupoy® Medical – Dental Applications',
    brand: 'LG Chem',
    grade: 'Lupoy Medical Dental',
    category: 'resins',
    subtype: 'Dental Grade',
    shortDescription:
      'Biocompatible PC for dental device components and orthodontic appliance housings.',
    description:
      'Lupoy® Medical Dental combines biocompatibility with sufficient hardness for dental devices, including appliance housings, temporary fix components, and tooth-contacting parts.',
    applications: [
      'Orthodontic appliance cases',
      'Temporary prosthetic guides',
      'Dental device housings',
      'Tooth-contacting components',
    ],
    industries: ['medical'],
    features: ['Oral biocompatible', 'Autoclavable', 'Tooth-shade colors', 'FDA cleared'],
    specifications: { density: '1.20 g/cm³', tensileStrength: '62 MPa', heatDeflection: '130 °C' },
    certifications: ['ISO 10993-1', 'FDA 21 CFR 876.1850'],
    inStock: true,
    featured: false,
    tags: ['medical', 'dental', 'oral'],
    image: '/pictures/s-l960 (7).webp',
    datasheetUrl: getProductCatalogueUrl('lupoy-medical-dental-applications', 'LG Chem'),
  },
  {
    id: '40',
    slug: 'makrolon-medical-sports-prosthetics',
    name: 'Makrolon® Medical – Sports Prosthetics',
    brand: 'Covestro',
    grade: 'Makrolon Prosthetic',
    category: 'resins',
    subtype: 'Sports Medicine',
    shortDescription:
      'Medical-grade PC for prosthetic devices and orthotic components requiring high durability.',
    description:
      'Makrolon® Prosthetic combines biocompatibility, mechanical strength, and durability for prosthetic sockets, ankle-foot orthosis (AFO) shells, and sports rehabilitation devices.',
    applications: [
      'Prosthetic sockets',
      'Orthotic shells',
      'Sports knee braces',
      'Rehabilitation device housings',
    ],
    industries: ['medical'],
    features: [
      'High durability',
      'ISO 10993 compliant',
      'Weight optimized',
      'Thermoplastically formable',
    ],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      heatDeflection: '130 °C',
      impactStrength: 'High',
    },
    certifications: ['ISO 10993', 'ISO 13485', 'FDA'],
    inStock: true,
    featured: false,
    tags: ['medical', 'prosthetics', 'orthotic'],
    image: '/pictures/s-l960 (8).webp',
    datasheetUrl: getProductCatalogueUrl('makrolon-medical-sports-prosthetics', 'Covestro'),
  },
  {
    id: '41',
    slug: 'lexan-medical-surgical-safety-guards',
    name: 'LEXAN™ Medical – Surgical Safety Guards',
    brand: 'SABIC',
    grade: 'LEXAN Medical Guard',
    category: 'resins',
    subtype: 'Medical Safety',
    shortDescription:
      'Medical-grade PC offering ballistic and impact protection for surgical and clinical environments.',
    description:
      'LEXAN™ Medical Guard combines ISO 10993 biocompatibility with exceptional impact resistance for protective barriers, surgical shields, and clinical equipment guards.',
    applications: [
      'Protective surgical barriers',
      'Operating room shields',
      'Patient protection barriers',
      'Clinical equipment guards',
    ],
    industries: ['medical'],
    features: ['Impact resistant', 'ISO 10993 compliant', 'Sterilizable', 'Barrier certified'],
    specifications: {
      density: '1.20 g/cm³',
      tensileStrength: '62 MPa',
      impactStrength: 'Ballistic rated',
      heatDeflection: '130 °C',
    },
    certifications: ['ISO 10993', 'ISO 13485', 'FDA', 'EN 356'],
    inStock: true,
    featured: false,
    tags: ['medical', 'safety', 'barrier'],
    image: '/pictures/s-l960 (9).webp',
    datasheetUrl: getProductCatalogueUrl('lexan-medical-surgical-safety-guards', 'SABIC'),
  },
];

// ─── Applications / Industries ───────────────────────────────────────────────

export const applications: Application[] = [
  {
    id: 'automotive',
    slug: 'automotive',
    title: 'Automotive',
    subtitle: 'Lightweighting & Optical Performance',
    description:
      'From panoramic roofs to headlamp lenses, polycarbonate enables sophisticated automotive designs with up to 50% weight savings over glass while meeting UNECE safety regulations.',
    icon: 'Car',
    image: '/pictures/se-bmw-8-series-vert-7.jpg',
    products: ['3', '11', '21', '32'],
    benefits: [
      '50% lighter than glass',
      'Design freedom',
      'Integrated functions',
      'Scratch-resistant coatings',
    ],
  },
  {
    id: 'construction',
    slug: 'construction',
    title: 'Construction & Architecture',
    subtitle: 'Glazing, Roofing & Facades',
    description:
      'Polycarbonate sheets deliver daylight with thermal insulation in architectural glazing, atrium roofing, and facade systems — combining the clarity of glass with a fraction of the weight.',
    icon: 'Building2',
    image: '/pictures/terrace-behind-house-made-beams-260nw-2666112465.webp',
    products: ['2', '13', '14', '15'],
    benefits: [
      '250× impact over glass',
      'Thermal insulation',
      'UV protection',
      'Rapid installation',
    ],
  },
  {
    id: 'medical',
    slug: 'medical',
    title: 'Medical Devices',
    subtitle: 'Biocompatibility & Sterilizability',
    description:
      'Medical-grade PC offers ISO 10993 biocompatibility, gamma and EtO sterilization resistance, and excellent dimensional stability for critical diagnostic and surgical applications.',
    icon: 'Stethoscope',
    image: '/pictures/polycarbonate-enclosure-features.jpg',
    products: ['34', '35', '36', '37', '38'],
    benefits: [
      'ISO 10993 compliant',
      'EtO & gamma stable',
      'Optical clarity',
      'Batch traceability',
    ],
  },
  {
    id: 'electronics',
    slug: 'electronics',
    title: 'Electronics & Electrical',
    subtitle: 'FR Performance & Miniaturization',
    description:
      'Halogen-free FR-rated polycarbonate compounds enable thin-wall electronic enclosures, EV battery modules, and PCB supports that meet the strictest global flammability directives.',
    icon: 'Cpu',
    image: '/pictures/PC-plastic-application-in-consumer-electronic.webp',
    products: ['25', '27', '30', '33'],
    benefits: ['UL 94 V-0 at 1 mm', 'Halogen-free', 'EMI shielded grades', 'Thin-wall capability'],
  },
  {
    id: 'optical',
    slug: 'optical',
    title: 'Optics & Lighting',
    subtitle: 'Clarity, Precision & Efficiency',
    description:
      'Optical-grade PC resins with >92% transmittance and low birefringence are the material of choice for LED light guides, automotive optics, and precision lens systems.',
    icon: 'Lightbulb',
    image: '/pictures/BMW-Laser-light-detail-on-G15-8-Series.jpg',
    products: ['12', '22', '24', '35'],
    benefits: ['>92% transmittance', 'Low birefringence', 'High precision', 'Colour stability'],
  },
  {
    id: 'safety',
    slug: 'safety',
    title: 'Safety & Protection',
    subtitle: 'Impact Resistance & Ballistic Grades',
    description:
      "From riot shields to machine guards and bullet-resistant glazing, polycarbonate's unmatched impact resistance and optical clarity make it the premier transparent armour material.",
    icon: 'ShieldCheck',
    image: '/pictures/machine-guard-polycarbonate.webp',
    products: ['1', '29', '31', '41'],
    benefits: [
      '10× stronger than acrylic',
      'EN 356 certified grades',
      'Ballistic options',
      'Lightweight armour',
    ],
  },
  {
    id: 'agriculture',
    slug: 'agriculture',
    title: 'Agriculture',
    subtitle: 'Greenhouses, Shade Houses & Crop Lighting',
    description:
      'Multiwall polycarbonate panels have replaced glass as the preferred glazing for commercial greenhouses and polytunnels. Excellent light diffusion, thermal insulation, and decades-long UV stability translate directly into higher crop yields and lower heating costs.',
    icon: 'Sprout',
    image: '/pictures/sunpal-banner.jpg',
    products: ['2', '14', '28'],
    benefits: [
      'Diffuse light boosts yields',
      'U-value as low as 1.1 W/m²K',
      '50-year UV stability',
      'Impact-safe vs. glass hail damage',
    ],
  },
  {
    id: 'consumer',
    slug: 'consumer',
    title: 'Consumer Products',
    subtitle: 'Durability, Clarity & Design Freedom',
    description:
      "From eyewear lenses and reusable water bottles to sporting helmets and power-tool housings, polycarbonate's combination of optical clarity, toughness, and light weight powers an enormous range of everyday products.",
    icon: 'ShoppingBag',
    image: '/pictures/polycarbonate-enclosure-features.jpg',
    products: ['16', '26', '39', '40'],
    benefits: [
      'Lightweight vs. metals & glass',
      'Impact resistant',
      'Easy to colour & texture',
      'BPA-free food-contact grades available',
    ],
  },
];

// ─── Brands ──────────────────────────────────────────────────────────────────

export const brands: Brand[] = [
  {
    id: 'covestro',
    name: 'Covestro – Makrolon®',
    logo: '/logos/covestro.svg',
    country: 'Germany',
    description:
      'World-leading PC producer. Makrolon® and Bayfol® brands cover general-purpose through specialty grades.',
    grades: ['Makrolon 2407', 'Makrolon 2858', 'Makrolon GF30', 'Bayfol HX'],
    specialties: ['Optical sheets', 'Flame-retardant grades', 'Weatherable glazing'],
    flagshipSeries: 'Makrolon 2407 / 2858',
    leadTime: '2-4 weeks',
  },
  {
    id: 'sabic',
    name: 'SABIC – LEXAN™',
    logo: '/logos/sabic.svg',
    country: 'Saudi Arabia / Netherlands',
    description:
      'Extensive LEXAN™ portfolio from optical to structural grades, including Thermoclear® sheet systems.',
    grades: ['LEXAN 940', 'LEXAN 121R', 'LEXAN EXL', 'Thermoclear 2UV'],
    specialties: ['Multiwall systems', 'High-impact resin', 'Electrical housings'],
    flagshipSeries: 'LEXAN 940',
    leadTime: '2-5 weeks',
  },
  {
    id: 'trinseo',
    name: 'Trinseo – Calibre™',
    logo: '/logos/trinseo.svg',
    country: 'USA',
    description:
      'Calibre™ PC and PC/ABS blends offering balanced cost-performance for automotive and consumer products.',
    grades: ['Calibre 301-10', 'Calibre EP5030', 'Calibre 200-3'],
    specialties: ['PC/ABS blends', 'Thin-wall injection', 'General-purpose molding'],
    flagshipSeries: 'Calibre 301-10',
    leadTime: '3-5 weeks',
  },
  {
    id: 'teijin',
    name: 'Teijin – Panlite®',
    logo: '/logos/teijin.svg',
    country: 'Japan',
    description:
      'Japanese engineering plastics leader. Panlite® medical and optical grades are renowned for purity.',
    grades: ['Panlite L-1225', 'Panlite AD-5503', 'Panlite TN-8065'],
    specialties: ['Medical compliance', 'Optical clarity', 'High-purity resin'],
    flagshipSeries: 'Panlite AD-5503',
    leadTime: '3-6 weeks',
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi – Iupilon®',
    logo: '/logos/mitsubishi.svg',
    country: 'Japan',
    description:
      'Iupilon® covers standard through high-heat copolymer grades for automotive and electronics sectors.',
    grades: ['Iupilon H-3000', 'Iupilon S-2000', 'Iupilon E-2000'],
    specialties: ['High-heat copolymers', 'Automotive modules', 'Dimensional stability'],
    flagshipSeries: 'Iupilon H-3000',
    leadTime: '3-6 weeks',
  },
  {
    id: 'lgnci',
    name: 'LG Chem – Lupoy®',
    logo: '/logos/lgchem.svg',
    country: 'South Korea',
    description:
      'Lupoy® range includes transparent, opaque, and alloy grades for consumer electronics and appliances.',
    grades: ['Lupoy GP1000M', 'Lupoy PC1100', 'Lupoy HI1001'],
    specialties: ['Consumer electronics', 'Appliance housings', 'Balanced toughness'],
    flagshipSeries: 'Lupoy GP1000M',
    leadTime: '2-5 weeks',
  },
];

// ─── Testimonials ────────────────────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Michael Brennan',
    title: 'R&D Director',
    company: 'Tier-1 Automotive OEM',
    industry: 'automotive',
    quote:
      'Covestro PC supplied Makrolon GF30 for our EV battery bracket program with zero lot rejections across 18 months of production. Their application engineers resolved our weld-line issue in two weeks. Genuinely impressive technical support.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Sabrine El-Amin',
    title: 'Procurement Manager',
    company: 'ArchGlass International',
    industry: 'construction',
    quote:
      'We switched from a conventional glazing supplier to Covestro PC for a major stadium project. LEXAN Thermoclear delivery was on schedule, technical datasheets were comprehensive, and their project team was available throughout the certification process.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Dr. Kevin Park',
    title: 'Materials Engineer',
    company: 'MedTech Innovations',
    industry: 'medical',
    quote:
      'Finding ISO 10993-compliant PC resin with full traceability used to be a nightmare. Covestro PC maintains dedicated medical-grade inventory and provides Certificate of Conformance with every shipment. A supplier we genuinely trust.',
    rating: 5,
  },
  {
    id: 't4',
    name: 'Elena Vasquez',
    title: 'VP Engineering',
    company: 'PowerGrid Electronics',
    industry: 'electronics',
    quote:
      "Calibre EP5030 has been our go-to V-0 candidate for three product generations. Covestro PC's technical team helped us optimise gate locations to maintain flame rating in thin-wall sections. Exceptional partnership.",
    rating: 4,
  },
];

// ─── Blog posts ──────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'polycarbonate-automotive-lightweighting',
    title: 'How Polycarbonate Is Driving EV Lightweighting by 2026',
    excerpt:
      'As EV manufacturers target sub-1,800 kg kerb weights, polycarbonate glazing and structural components are replacing glass and metal at unprecedented scale.',
    category: 'AUTOMOTIVE',
    image: '/pictures/2020-bmw-3-series-revealed-in-stunning-photo-shoot-more-power-on-tap_31.jpg',
    publishedAt: '2026-03-18',
    readTime: 7,
  },
  {
    id: 'b2',
    slug: 'circular-economy-pc-recycling',
    title: 'Closing the Loop: Chemical Recycling of Post-Consumer Polycarbonate',
    excerpt:
      "New glycolysis and hydrolysis routes now recover bisphenol-A and diol monomers from PC waste streams at >95% purity — reshaping the industry's sustainability story.",
    category: 'SUSTAINABILITY',
    image: '/pictures/polycarbonate-1-1.jpg',
    publishedAt: '2026-02-28',
    readTime: 9,
  },
  {
    id: 'b3',
    slug: 'medical-pc-sterilisation-guide',
    title: 'Sterilisation Compatibility Guide for Medical PC Grades',
    excerpt:
      'Not all polycarbonate grades withstand repeated autoclaving, gamma irradiation, or EtO cycles equally. This technical guide maps compatibility for nine common sterilisation methods.',
    category: 'specialty',
    image: '/pictures/PH2_Group.webp',
    publishedAt: '2026-01-15',
    readTime: 12,
  },
  {
    id: 'b4',
    slug: 'pc-multiwall-energy-savings',
    title: 'Calculating Energy Savings with Multiwall PC Roofing vs. Glass',
    excerpt:
      'A side-by-side thermal analysis of glass, twin-wall, and 5-wall polycarbonate panels across four climate zones reveals striking HVAC cost differences for architects.',
    category: 'CONSTRUCTION',
    image: '/pictures/polycarbonate-roofing-1.jpg',
    publishedAt: '2025-12-10',
    readTime: 8,
  },
  {
    id: 'b5',
    slug: 'pc-composite-bonnet-panels',
    title: 'PC Composite Bonnet Panels: The Case Against Aluminium in EV Hoods',
    excerpt:
      'Glass-fibre-reinforced polycarbonate composites are challenging aluminium for EV hood and closure panels — delivering 35% weight savings, Class-A paintability, and pedestrian safety compliance in a single component.',
    category: 'AUTOMOTIVE',
    image: '/pictures/automotive-polycarbonate-bonnet-panel.jpg',
    publishedAt: '2026-04-02',
    readTime: 6,
  },
  {
    id: 'b6',
    slug: 'polycarbonate-electronics-fr-trends',
    title: 'FR-Rated Polycarbonate in 2026: Thin Walls, Halogen-Free, and IEC-Ready',
    excerpt:
      'The latest generation of UL 94 V-0 PC compounds achieves flame ratings at 0.8 mm wall thickness without halogens — meeting IEC 62368-1 and EN 45545-2 simultaneously. Here is what the shift means for electronic enclosure designers.',
    category: 'ELECTRONICS',
    image: '/pictures/what-are-the-future-trends-for-polycarbonate-in-electronics-3.webp',
    publishedAt: '2026-03-05',
    readTime: 10,
  },
];

export const homepageVisualProofPanels: HomepageVisualProofPanel[] = [
  {
    src: '/pictures/Blade-silver-C6-Corvette-Z06-with-gloss-carbon-flash-and-cyber-grey-stinger-jake-skull-1.jpg',
    alt: 'Silver Corvette Z06 with polycarbonate composite hood panel',
    label: 'Automotive',
    href: '/applications/automotive',
  },
  {
    src: '/pictures/display-home-the-allure-ventura-homes-img~d171fd60030303a3_14-0136-1-04d2e99.jpg',
    alt: 'Modern patio with transparent polycarbonate roofing and outdoor fireplace',
    label: 'Architecture',
    href: '/applications/construction',
  },
  {
    src: '/pictures/istockphoto-686873268-612x612.jpg',
    alt: 'Golden sunset through amber polycarbonate canopy panels',
    label: 'Canopy Systems',
    href: '/applications/construction',
  },
];

export const homepageHeroSlides: HomepageHeroSlide[] = [
  {
    tag: 'MATERIAL SCIENCE — DEMONSTRATED',
    headline: 'Engineered to Endure.',
    subheadline:
      'Watch polycarbonate survive extreme bending, drilling, sub-zero exposure, and high-velocity impact — then spec the grade that fits your project.',
    cta: { label: 'Browse Products', href: '/products' },
    secondaryCta: { label: 'Download Catalogue', href: '/resources' },
    bgClass: 'from-steel-950 via-steel-900 to-brand-900',
    image: '/pictures/What-is-Polycarbonate.jpg',
    video: '/videos/properties-montage.mp4',
    videoWebm: '/videos/properties-montage.webm',
    videoPoster: '/video-posters/properties-montage.jpg',
  },
  {
    tag: 'AUTOMOTIVE PERFORMANCE',
    headline: 'Half the Weight. All the Clarity.',
    subheadline:
      'Panoramic roofs, headlamp lenses, composite hoods — polycarbonate is replacing glass across the next generation of vehicles.',
    cta: { label: 'Explore Automotive', href: '/applications/automotive' },
    secondaryCta: { label: 'Request Quote', href: '/quote?source=hero-automotive' },
    bgClass: 'from-steel-950 via-brand-950 to-brand-900',
    image: '/pictures/2021_bmw_7-series_sedan_750i-xdrive_edetail_oem_1_815.avif',
  },
  {
    tag: 'ARCHITECTURE & LIFESTYLE',
    headline: 'Daylight, Refined.',
    subheadline:
      'Luxury rooftop lounges, atrium skylights, and residential canopies — multiwall and solid sheet systems that perform for decades.',
    cta: { label: 'View Sheet Products', href: '/products?category=sheets' },
    secondaryCta: { label: 'Talk to an Expert', href: '/contact' },
    bgClass: 'from-steel-950 via-steel-900 to-cyan-950',
    image: '/pictures/luxury-balcony-polycarbonate-roof.jpg',
  },
  {
    tag: 'COMMERCIAL FACADES',
    headline: 'Light as a Building Material.',
    subheadline:
      'Translucent polycarbonate walls that glow from within — transforming commercial architecture into landmarks.',
    cta: { label: 'View Applications', href: '/applications/construction' },
    secondaryCta: { label: 'Get a Quote', href: '/quote?source=hero-commercial' },
    bgClass: 'from-steel-950 via-cyan-950 to-brand-900',
    image: '/pictures/danpatherm-gallery.jpg',
  },
];

export const homepageHeroImageSources = homepageHeroSlides.map((slide) => slide.image);

export const homepageCinematicBandImage = '/pictures/ABAF2013-B764-4E6D-9796-21B89EFA1905.jpg';

const spectacularMarqueeItems: GalleryShowcaseCard[] = curatedPictureGalleryItems.map((image) => {
  const { label, href } = galleryLabelAndHref(image.category);
  return {
    src: image.src,
    alt: image.alt,
    label,
    href,
  };
});

export const spectacularGalleryContent = {
  spotlight: {
    src: '/pictures/ABAF2013-B764-4E6D-9796-21B89EFA1905.jpg',
    alt: 'Polycarbonate application showcase',
    label: 'Architecture',
    href: '/applications/architecture',
  },
  tilt: [
    {
      src: '/pictures/bmw-laserlights-i8-03.jpg',
      alt: 'Automotive polycarbonate application',
      label: 'Automotive',
      href: '/applications/automotive',
    },
    {
      src: '/pictures/luxury-balcony-polycarbonate-roof.jpg',
      alt: 'Architectural polycarbonate application',
      label: 'Construction',
      href: '/applications/construction',
    },
    {
      src: '/pictures/machine-guard-polycarbonate.webp',
      alt: 'Industrial electronics polycarbonate application',
      label: 'Electronics',
      href: '/applications/electronics',
    },
    {
      src: '/pictures/medical-polycarbonate-device.jpg',
      alt: 'Medical polycarbonate application',
      label: 'Medical',
      href: '/applications/medical',
    },
  ],
  marquee: spectacularMarqueeItems,
};

// Helper functions and exports
export function getFeaturedProducts() {
  return products.slice(0, 3); // Return first 3 products as featured
}

export const productCategories: ProductCategory[] = ['sheets', 'rods', 'resins', 'specialty'];

export const industryOptions = [
  { value: 'automotive', label: 'Automotive' },
  { value: 'medical', label: 'Medical' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'industrial', label: 'Industrial' },
];

export const brandOptions = [
  { value: 'makrolon', label: 'Makrolon' },
  { value: 'lexan', label: 'Lexan' },
  { value: 'sabic', label: 'SABIC' },
  { value: 'other', label: 'Other' },
];

export function getApplicationBySlug(slug: string): Application | undefined {
  return applications.find((app) => app.slug === slug);
}

export function getProductsByIndustry(industry: string): Product[] {
  return products.filter((product) => product.industries?.includes(industry as ProductIndustry));
}

export const spectacularGallerySelectionDiagnostics: SpectacularGallerySelectionDiagnostics = {
  reservedSourceCount: 0,
  selectedSourceCount: 0,
  totalCuratedSourceCount: 0,
  availableSourceCount: 0,
  unusedCuratedSourceCount: 0,
  selectedReservedOverlapCount: 0,
  marqueeTargetCount: 0,
  marqueeRenderedCount: 0,
  marqueeShortfallCount: 0,
  marqueeUniqueSourceCount: 0,
  marqueeDuplicateSourceCount: 0,
  fallbackSelectionCount: 0,
  spotlightFallbackCount: 0,
  tiltFallbackCount: 0,
  tiltCategoryMismatchCount: 0,
  marqueeRecycleCount: 0,
  selectionDiversityRatio: 1,
  marqueeUniquenessRatio: 1,
  reservedSourceRatio: 0,
  selectedSourceRatio: 0,
  availableSourceRatio: 1,
  marqueeRowOverlapCount: 0,
  marqueeRowOverlapRatio: 0,
  coverageCategoryCount: 0,
  categoryCoverageRatio: 0,
  selectedCategoryCoverage: {
    automotive: 0,
    architecture: 0,
    canopy: 0,
    industrial: 0,
    medical: 0,
    materials: 0,
  },
  missingSelectedCategories: [],
  alertFlags: {
    reservedOverlap: false,
    marqueeShortfall: false,
    fallbackUsed: false,
    duplicatePressure: false,
    tiltMismatch: false,
    missingCategories: false,
    lowDiversity: false,
    lowUniqueness: false,
    highReservedPressure: false,
    rowOverlapHigh: false,
    coverageThin: false,
  },
  activeAlertCount: 0,
  degradedAlertCount: 0,
  watchAlertCount: 0,
  severityScore: 0,
  severityBand: 'ok',
  topAlertKeys: [],
  alertSummary: 'No active gallery alerts',
  triageHint: 'Diagnostics baseline',
  snapshotKey: 'baseline',
  snapshotLine: 'Baseline diagnostics',
  healthStatus: 'healthy',
  healthNotes: [],
};

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRecentDatasheets(limit: number = 6): DatasheetDocument[] {
  return datasheetLibrary.slice(0, limit);
}

export function getUnmappedDatasheets(): DatasheetDocument[] {
  return datasheetLibrary.filter((doc) => doc.relatedProductSlugs.length === 0);
}

export function getDatasheetsForProduct(product: Product): DatasheetDocument[] {
  return datasheetLibrary.filter((doc) => doc.relatedProductSlugs.includes(product.slug));
}

export function getRelatedProducts(product: Product, limit: number = 4): Product[] {
  const categoryMatches = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category
  );

  const brandMatches = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      candidate.category !== product.category &&
      candidate.brand === product.brand
  );

  return [...categoryMatches, ...brandMatches].slice(0, limit);
}
