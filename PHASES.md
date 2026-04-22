# PHASES

## Phase 1 - Foundation Baseline (Completed)
Date: 2026-04-14

Completed:
- Verified type-check and build pipeline health.
- Fixed prerender failure on product detail page by removing server-side event handler usage.
- Aligned README lead/email integration docs with implemented Resend + webhook flow.

Files touched:
- app/products/[slug]/page.tsx
- README.md

## Phase 2 - Datasheet Wiring (Completed)
Date: 2026-04-14

Completed:
- Added `datasheetUrl?: string` to the Product model.
- Added datasheet URLs for selected products in `lib/data.ts`.
- Updated product detail CTA to conditionally render:
  - active download link when `datasheetUrl` exists
  - disabled "Datasheet Coming Soon" state when missing
- Surfaced datasheet availability in product card surfaces:
  - catalog cards in `app/products/page.tsx`
  - featured cards in `components/featured-products.tsx`
- Added static datasheet folder scaffold at `public/datasheets/` with usage notes.
- Re-validated type-check and production build after UI updates.

Files touched:
- lib/data.ts
- app/products/[slug]/page.tsx
- app/products/page.tsx
- components/featured-products.tsx
- public/datasheets/README.md

Open items:
- Add actual PDF files under `public/datasheets/` for linked products.

## Phase 3 - Route Completion (Completed)
Date: 2026-04-14

Completed:
- Added missing application detail route at `app/applications/[slug]/page.tsx`.
- Added missing brands route at `app/brands/page.tsx`.
- Added missing resources routes at `app/resources/page.tsx` and `app/resources/[slug]/page.tsx`.
- Expanded sitemap entries for brands/resources/resource-detail URLs.
- Re-validated type-check and production build (30 static pages generated).

Files touched:
- app/applications/[slug]/page.tsx
- app/brands/page.tsx
- app/resources/page.tsx
- app/resources/[slug]/page.tsx
- app/sitemap.ts

## Phase 4 - Asset Completion (Completed)
Date: 2026-04-15

Goal:
- Replace placeholder datasheet URLs with real downloadable PDFs present in `public/datasheets/`.

Completed:
- Added local PDF assets under `public/datasheets/` for all currently hosted brand catalogues referenced in `lib/data.ts`.
- Verified that production build succeeds after datasheet wiring changes.
- Switched Teijin from an external URL to a local file under `public/datasheets/`.

Suggested checklist:
1. Add PDF files matching current paths in `lib/data.ts`.
2. Click-test datasheet buttons on `/products` and `/products/[slug]`.
3. Re-run `npm run build` after assets are in place.

Progress update:
- All products now explicitly define a datasheet state in `lib/data.ts`:
  - available products use concrete `datasheetUrl` values
  - unavailable products use `datasheetUrl: undefined` (intentional coming-soon)

## Phase 5 - Local Image Migration (Completed)
Date: 2026-04-15

Goal:
- Replace external product/application/hero image URLs with local assets under `public/pictures/`.

Completed:
- Migrated all `products` image fields in `lib/data.ts` to local `/pictures/...` paths.
- Migrated all `applications` image fields in `lib/data.ts` to local `/pictures/...` paths.
- Migrated homepage hero slide images in `components/hero.tsx` to local `/pictures/...` paths.
- Re-validated production build after image URL migration.

Files touched:
- lib/data.ts
- components/hero.tsx

Notes:
- Blog/resource teaser images still use existing external placeholders and can be migrated in a follow-up phase if desired.

## Phase 6 - Resource Image Migration (Completed)
Date: 2026-04-15

Goal:
- Replace remaining external resource/blog post images with local assets under `public/pictures/`.

Completed:
- Migrated all `blogPosts` image fields in `lib/data.ts` to local `/pictures/...` paths.
- Re-validated production build after resource image migration.

Files touched:
- lib/data.ts

## Phase 7 - Asset Filename Standardization (Completed)
Date: 2026-04-15

Goal:
- Standardize referenced image filenames under `public/pictures/` to clean kebab-case names and keep all code references aligned.

Completed:
- Renamed referenced picture assets to stable kebab-case names.
- Updated all affected `/pictures/...` references in `lib/data.ts` and `components/hero.tsx`.
- Re-validated production build after filename changes.

Files touched:
- public/pictures/* (renamed referenced assets)
- lib/data.ts
- components/hero.tsx

## Phase 8 - Picture Folder Cleanup (Completed)
Date: 2026-04-15

Goal:
- Remove leftover temporary and duplicate picture files after image migration.

Completed:
- Removed temporary download artifact from `public/pictures/`.
- Removed duplicate image copy no longer referenced by the app.
- Re-validated production build after cleanup.

Files touched:
- public/pictures/Unconfirmed 884529.crdownload (deleted)
- public/pictures/IMG_3368-e1333981438134-640x480 (1).jpg (deleted)

## Phase 9 - Photo Refresh and LCP Polish (Completed)
Date: 2026-04-15

Goal:
- Replace selected image mappings with newly added photos and improve above-the-fold image loading on key routes.

Completed:
- Renamed selected newly added pictures to clean, stable filenames.
- Updated homepage hero to use stronger construction/glazing imagery from `public/pictures/`.
- Updated selected product/application/resource image mappings in `lib/data.ts` to use the new photos.
- Refined automotive image distribution so the automotive application and automotive resource use a precise side-window glazing photo, while an automotive-oriented product uses a bonnet panel image.
- Limited hero high-priority loading to the first slide only.
- Added priority loading to the application detail hero image.
- Re-validated production build after photo refresh and loading optimizations.

Files touched:
- public/pictures/* (selected new files renamed)
- lib/data.ts
- components/hero.tsx
- app/applications/[slug]/page.tsx

## Phase 10 - Full Visual Gallery Rollout (Completed)
Date: 2026-04-15

Goal:
- Use all available pictures from `public/pictures/` and increase visual density across the website.

Completed:
- Added an explicit picture registry in `lib/data.ts` containing all current image files under `public/pictures/`.
- Added reusable gallery component rendering masonry-style visuals from the full picture registry.
- Added new `/gallery` route for a full-site visual library.
- Added gallery section to the homepage to increase visual storytelling and surface more assets.
- Added Gallery link in top navigation and included `/gallery` in sitemap.
- Re-validated production build after visual rollout.

Files touched:
- lib/data.ts
- components/pictures-mosaic.tsx
- app/gallery/page.tsx
- app/page.tsx
- components/navbar.tsx
- app/sitemap.ts

## Phase 11 - Performance and Reliability Hardening (Completed)
Date: 2026-04-15

Goal:
- Improve visual rendering performance, add gallery context metadata, and harden local preview/build workflow reliability.

Completed:
- Added structured gallery metadata model (`category`, `alt`) derived from the picture registry.
- Updated gallery rendering to use metadata with contextual captions and category tags.
- Reduced eager-loading pressure in picture mosaics to improve page load behavior.
- Improved image-category consistency by assigning a materials-oriented visual to the electronics application card.
- Added stable scripts for clean dev/build workflows to avoid `.next` cache corruption.

Files touched:
- lib/data.ts
- components/pictures-mosaic.tsx
- package.json
- PHASES.md

Safe local workflow:
1. Preview: `npm run dev:stable`
2. Production build check: stop preview first, then run `npm run build:clean`

## Phase 12 - Video Segmentation and Strategic Placement (Completed)
Date: 2026-04-15

Goal:
- Convert a high-impact source video into targeted clips and deploy each clip in the most persuasive page sections.

Completed:
- Analyzed the full 86.5s source video frame-by-frame and mapped high-value scenes.
- Cut 6 optimized web clips and generated matching poster frames.
- Upgraded homepage hero slide 1 to support video background playback.
- Added a proof video block to the Why Polycarbonate section.
- Added a new Strength Callout section with commercial impact-test footage.
- Added installation/supply-chain video module to Contact sidebar.
- Added architecture-walkway video hero for the construction application detail page.
- Added properties montage strip to the products page.
- Re-validated production build after all video integration changes.

Files touched:
- public/videos/hero-loop.mp4
- public/videos/proof-pc-vs-glass.mp4
- public/videos/architecture-walkway.mp4
- public/videos/properties-montage.mp4
- public/videos/installation-supply.mp4
- public/videos/strength-commercial.mp4
- public/video-posters/hero-loop.jpg
- public/video-posters/proof-pc-vs-glass.jpg
- public/video-posters/architecture-walkway.jpg
- public/video-posters/properties-montage.jpg
- public/video-posters/installation-supply.jpg
- public/video-posters/strength-commercial.jpg
- components/hero.tsx
- components/why-polycarbonate.tsx
- components/strength-callout.tsx
- app/page.tsx
- app/contact/page.tsx
- app/applications/[slug]/page.tsx
- app/products/page.tsx
- PHASES.md

## Phase 13 - Video Delivery Optimization and Hero Visibility (Completed)
Date: 2026-04-15

Goal:
- Improve video delivery efficiency, reduce unnecessary off-screen playback, and make the homepage hero video more visually dominant.

Completed:
- Generated WebM fallbacks for all previously created MP4 clips.
- Added a reusable viewport-aware video component that pauses non-hero videos when out of view and resumes them when visible.
- Switched all non-hero embedded videos to dual-source delivery (WebM + MP4).
- Increased homepage hero video visibility by reducing the dark overlay opacity on the video slide to 50%.
- Re-validated production build after the video performance refactor.

Files touched:
- public/videos/hero-loop.webm
- public/videos/proof-pc-vs-glass.webm
- public/videos/architecture-walkway.webm
- public/videos/properties-montage.webm
- public/videos/installation-supply.webm
- public/videos/strength-commercial.webm
- components/viewport-video.tsx
- components/hero.tsx
- components/why-polycarbonate.tsx
- components/strength-callout.tsx
- app/contact/page.tsx
- app/applications/[slug]/page.tsx
- app/products/page.tsx
- PHASES.md

## Phase 14 - Homepage Beautification (Completed)
Date: 2026-04-15

Completed:
- Upgraded hero carousel from 3 to 4 slides with the most visually impactful images and video.
- Moved properties-montage video (bending/drilling/impact demo) from products page to hero slide 1 — the most engaging motion content now leads the homepage.
- Replaced old hero images: slide 2 now features the Black Corvette with polycarbonate hood panel, slide 4 is the Danpatherm glowing building at night.
- Reduced image-slide overlay from 85% to 65% so photographs are more visible and eye-catching.
- Created VisualProofStrip component: 3-column image grid ("Where Polycarbonate Lives") featuring Silver Corvette Z06, modern patio with PC roof, and golden sunset through amber PC — each linking to relevant applications.
- Created CinematicBand component: full-width parallax section with the ABAF sunroom image, headline "Built to last 80+ years. Proven across 6 continents." and CTA to applications.
- Updated homepage layout order: Hero → FilterSection → VisualProofStrip → FeaturedProducts → ApplicationsGrid → WhyPolycarbonate → StrengthCallout → CinematicBand → BrandsGrid → Testimonials → PicturesMosaic → BlogTeaser → CQ strip.
- Removed the properties-montage video strip from products page (now lives in hero) and cleaned up unused ViewportVideo import.
- Build passes clean: 35/35 pages, no TS/lint errors.

Files touched:
- components/hero.tsx
- components/visual-proof-strip.tsx (new)
- components/cinematic-band.tsx (new)
- app/page.tsx
- app/products/page.tsx
- PHASES.md

## Phase 15 - Spectacular Gallery Effects (Completed)
Date: 2026-04-15

Completed:
- Created SpectacularGallery component with three AI-level visual effects:
  1. **Spotlight Reveal** — Mouse cursor becomes a circle of light that cuts through a dark mask to reveal a hidden luxury rooftop image beneath. Text fades out on hover. Touch-compatible.
  2. **3D Tilt Cards with Glare** — Four cards (Automotive, Architecture, Facades, Medical) that rotate in real 3D space following mouse position via Framer Motion spring physics. Each card has a moving light-reflex glare that tracks the cursor, a floating label with translateZ depth, and a brand-colored border glow on hover.
  3. **Infinite Dual-Direction Marquee** — Two rows of 6 images each scrolling in opposite directions at 35s loop speed. Pauses on hover. Seamless loop via doubled array technique.
- Added marquee + marquee-reverse keyframe animations and Tailwind animation utilities to tailwind.config.ts.
- Replaced the static PicturesMosaic on the homepage with SpectacularGallery.
- Build passes clean: 35/35 pages, no TS/lint errors.

Files touched:
- components/spectacular-gallery.tsx (new)
- tailwind.config.ts
- app/page.tsx
- PHASES.md

## Phase 16 - Inner Pages Typography and Copy Polish (Completed)
Date: 2026-04-15

Goal:
- Extend homepage pro-grade typography and copy standards to all inner pages and shared navigation/footer surfaces.

Completed:
- Applied display-font treatment to key inner-page headings across products, applications, application detail, contact, resources, and about pages.
- Polished multiple section labels and body copy to improve clarity, hierarchy, and consistency with homepage tone.
- Updated brands and product detail pages for consistent heading weight/spacing behavior.
- Applied display-font treatment to prominent brand text in the navbar and CTA headline in the footer.
- Re-validated production build after UI text/typography updates.

Files touched:
- app/products/page.tsx
- app/applications/page.tsx
- app/applications/[slug]/page.tsx
- app/contact/page.tsx
- app/resources/page.tsx
- app/about/page.tsx
- app/products/[slug]/page.tsx
- app/brands/page.tsx
- components/navbar.tsx
- components/footer.tsx
- PHASES.md

## Phase 17 - Intelligent Datasheet Mapping (Completed)
Date: 2026-04-15

Goal:
- Use newly added datasheets more intelligently by prioritizing product-specific mappings with safe brand-level fallback.

Completed:
- Replaced broad brand-only datasheet assignment strategy with a product-first resolver.
- Added a dedicated `productCatalogueBySlug` map for explicit, maintainable datasheet targeting.
- Kept brand-level fallback in place via `brandCatalogueByBrand` to avoid missing links for future products.
- Updated all product records to use the new resolver function so datasheet selection is deterministic per SKU.
- Removed unrelated synthetic brand keys from the brand catalogue map to keep mappings accurate and maintainable.
- Re-validated production build: successful compile and static generation (35/35 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 18 - Datasheet Discovery Surfaces (Completed)
Date: 2026-04-15

Goal:
- Surface newly added datasheets directly in the UI so users can discover and download both product-mapped and general reference documents.

Completed:
- Added a centralized `datasheetLibrary` model in `lib/data.ts` with metadata for title, type, material family, brand, and product associations.
- Added datasheet helper utilities:
  - `getDatasheetsForProduct(product)` for product page related-document retrieval
  - `getUnmappedDatasheets()` for identifying general references not tied to a SKU
- Updated `/resources` page with a new **Technical Downloads** section that lists all datasheets and provides direct download actions.
- Updated product detail pages to show **Related Technical Documents** in the sidebar when supplemental docs exist beyond the primary product datasheet.
- Re-validated production build after the UI + data changes (35/35 pages).

Files touched:
- lib/data.ts
- app/resources/page.tsx
- app/products/[slug]/page.tsx
- PHASES.md

## Phase 19 - Datasheet Library Filters (Completed)
Date: 2026-04-15

Goal:
- Improve datasheet retrieval speed by adding practical filter controls directly in the Resources technical downloads section.

Completed:
- Added URL-driven server-side filtering for datasheets by brand, document type, and material family on `/resources`.
- Implemented shareable filter state via query parameters (`brand`, `type`, `family`) with clean fallback to unfiltered view.
- Added filter chip groups with active-state styling and one-click reset per filter dimension.
- Added empty-state messaging when no datasheets match the selected filter combination.
- Re-validated production build after filter implementation (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 20 - Datasheet Keyword Search (Completed)
Date: 2026-04-15

Goal:
- Make datasheet discovery faster by adding keyword search that works alongside existing filters.

Completed:
- Added URL-driven keyword search (`q`) to `/resources` datasheet library.
- Search now matches across datasheet title, brand, document type, and material family.
- Preserved active brand/type/material filters when submitting search queries.
- Added a one-click clear action for active keyword search.
- Added result count messaging for better visibility into filtered/search result scope.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 21 - Datasheet Result Sorting (Completed)
Date: 2026-04-15

Goal:
- Improve datasheet browsing control by allowing users to reorder search/filter results.

Completed:
- Added URL-driven sort mode (`sort`) for datasheet results on `/resources`.
- Added sort options:
  - Title A-Z
  - Title Z-A
  - Brand
  - Type
- Ensured sort state is preserved with active filters and keyword search.
- Updated the datasheet result rendering to use sorted output.
- Re-validated production build after sorting implementation (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 22 - Datasheet Result Pagination (Completed)
Date: 2026-04-15

Goal:
- Keep the datasheet library scalable and easier to browse as more documents are added.

Completed:
- Added URL-driven pagination to datasheet results on `/resources` using the `page` query parameter.
- Limited datasheet grid rendering to a fixed page size and computed total pages server-side.
- Added Previous/Next controls plus explicit page number links.
- Preserved pagination compatibility with existing brand/type/material filters, keyword search, and sorting.
- Added result summary messaging showing current page, page count, and filtered dataset size.
- Re-validated production build after pagination implementation (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 23 - Active Datasheet State Chips (Completed)
Date: 2026-04-15

Goal:
- Make complex datasheet filter states easier to understand and unwind without losing the rest of the user’s context.

Completed:
- Added a compact active-state summary section on `/resources` for datasheet browsing.
- Added removable chips for active brand, type, material family, keyword search, and non-default sort state.
- Added a one-click `Clear all` action that resets the datasheet library view to its default state.
- Kept chip removal URL-driven so active state remains shareable and server-rendered.
- Re-validated production build after the UX update (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 24 - Homepage Datasheet Spotlight (Completed)
Date: 2026-04-15

Goal:
- Surface the expanded technical download system directly on the homepage so users can jump into filtered datasheet views earlier in the browsing journey.

Completed:
- Added a new `DatasheetSpotlight` homepage section with three pre-filtered entry routes:
  - Primary Datasheets
  - Brochures & Grade Guides
  - Engineering References
- Displayed live document counts in each spotlight card using the centralized datasheet library.
- Linked each spotlight card into the existing `/resources` query-driven discovery experience.
- Inserted the new spotlight section into the homepage flow after Featured Products.
- Re-validated production build after the homepage integration (35/35 pages generated).

Files touched:
- components/datasheet-spotlight.tsx
- app/page.tsx
- PHASES.md

## Phase 25 - Recent Datasheets Module (Completed)
Date: 2026-04-15

Goal:
- Improve technical document discoverability by surfacing newly added datasheets directly in the Resources experience.

Completed:
- Extended the datasheet model with `publishedAt` metadata for each document.
- Added `getRecentDatasheets(limit)` helper to provide a consistent, date-sorted source for recent items.
- Added a new "Recently Added Datasheets" strip to `/resources` with direct download actions.
- Extended sort controls with date-driven options:
  - Newest
  - Oldest
- Updated active sort chip labels to include date-based states.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- lib/data.ts
- app/resources/page.tsx
- PHASES.md

## Phase 26 - Homepage "What’s New This Month" (Completed)
Date: 2026-04-15

Goal:
- Surface newly added technical documents directly on the homepage to reduce time-to-discovery for returning users.

Completed:
- Enhanced the existing homepage datasheet spotlight with a dedicated "What’s New This Month" strip.
- Added month-aware recent document logic:
  - prioritizes datasheets published in the current month
  - falls back to latest available entries when the current month has no additions
- Added an "Updated {Month Year}" freshness stamp.
- Added three quick-entry document cards linking to pre-filtered `/resources` views.
- Added "View all recent documents" CTA linking to date-sorted resources results.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- components/datasheet-spotlight.tsx
- PHASES.md

## Phase 27 - Datasheet "NEW" Badge System (Completed)
Date: 2026-04-15

Goal:
- Improve scanability in the technical library by making recently added datasheets stand out at a glance.

Completed:
- Added date-window freshness logic to resources datasheet cards.
- Added visual `NEW` badges for documents published within the last 30 days.
- Added an "Added {date}" metadata line on each datasheet card for immediate recency context.
- Kept all behavior compatible with existing filters, search, sorting, and pagination.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 28 - "Only NEW" Quick Filter Toggle (Completed)
Date: 2026-04-15

Goal:
- Let users instantly narrow the datasheet library to recently published documents with a single click, without losing their existing filter context.

Completed:
- Added `onlynew` query parameter support to the `/resources` datasheet library.
- Applied a pre-filter gate (`showOnlyNew`) before brand/type/family/search filters so "New Only" composes cleanly with all existing controls.
- Added a "Quick Filter" row with a `New Only (N)` toggle pill showing a live count of qualifying documents.
- Imported `Sparkles` lucide icon to visually distinguish the toggle from the standard filter chips.
- Added `onlynew` to `buildFilterHref` so state is correctly preserved across all sort, filter, search, and pagination navigations.
- Added a `onlynew` active chip in the Active state row with one-click removal.
- Added `onlynew` as a hidden input in the search form so keyword submissions preserve the toggle state.
- Toggle and chip both link to `page=1` on activation, preventing stale pagination.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- app/resources/page.tsx
- PHASES.md

## Phase 29 - Product Catalog Sort Controls and In-Stock Filter (Completed)
Date: 2026-04-15

Goal:
- Match the product catalog's browsing quality to the feature-rich datasheet library by adding sort and quick stock filter controls.

Completed:
- Added a Sort select to the `ProductFilters` client component with four modes:
  - Name A-Z (default)
  - Name Z-A
  - Brand (alphabetical, secondary sort by name)
  - In-Stock First (stock status primary, name secondary)
- Added an "In Stock" quick-toggle button with active/inactive styling and `aria-pressed` semantics.
- Imported `PackageCheck` lucide icon for the In-Stock toggle to aid scannability.
- Extended `filterProducts` in `app/products/page.tsx` to apply `instock` pre-filter before all other filters, then sort the result set according to the `sort` param.
- Added `sort` and `instock` to `activeFiltersCount` and active filter chip rendering.
- `hasFilters` in `ProductFilters` now also tracks non-default sort and active stock toggle, ensuring the reset button appears correctly.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- components/product-filters.tsx
- app/products/page.tsx
- PHASES.md

## Phase 30 - Similar Products Section on Product Detail (Completed)
Date: 2026-04-15

Goal:
- Close the product browsing loop by surfacing related products at the bottom of every product detail page, keeping users engaged in the catalog.

Completed:
- Added `getRelatedProducts(product, limit)` helper to `lib/data.ts`:
  - Prioritises same-category products, ranked by shared industry count then featured flag.
  - Backfills with any-industry-match products if same-category count is below the limit.
  - Excludes the current product by slug.
- Added `ArrowRight` and `getRelatedProducts` imports to `app/products/[slug]/page.tsx`.
- Added a "Similar Products" section below the specs table, above the Back link:
  - Section header with "Keep Exploring" label and "View all {category} →" CTA linking to pre-filtered `/products?category=…`.
  - 4-column responsive card grid (same style as main catalog cards) with image, brand/grade, name, excerpt, and "View →" link.
  - Section is conditionally rendered and absent when no similar products are found.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- lib/data.ts
- app/products/[slug]/page.tsx
- PHASES.md

## Phase 31 - Brands Page Enhancements (Completed)
Date: 2026-04-15

Goal:
- Turn the static brands listing into an actionable discovery surface by surfacing real product data per brand.

Completed:
- Imported `products` into `app/brands/page.tsx` to compute per-brand stats at build time.
- Added per-brand product count badge (e.g., "3 grades") in the card header using a `Package` icon.
- Added category coverage chips per brand (Sheets / Rods / Resins / Specialty) with distinct colours matching the product catalog badge scheme — replacing the old grade chip fallback for brands that have mapped products.
- Added in-stock count indicator in browser green ("● N in stock") or "Available to order" text when none are in stock.
- Added a "Browse N products →" deep-link in each card footer linking to the pre-filtered `/products?brand=…` catalog view. Link is omitted for brands with no mapped products.
- Enhanced card layout: full-height flex column so footer row always aligns at bottom; hover shadow and border highlight matching the catalog card treatment.
- Re-validated production build after implementation (35/35 pages generated).

Files touched:
- app/brands/page.tsx
- PHASES.md

## Phase 32 - FAQ Page with Structured Data (Completed)
Date: 2026-04-15

Goal:
- Add a comprehensive FAQ page to improve SEO through FAQ schema markup and reduce pre-sales support load.

Completed:
- Created `app/faq/page.tsx` as a new static route with 20 detailed Q&As across 5 sections:
  - Material & Grades (6 items): solid vs multiwall vs corrugated, optical grade, UL94 flame ratings, UV stability, service temperature, chemical resistance.
  - Ordering & Availability (4 items): MOQs, lead times, sample policy, ISO/IATF documentation.
  - Technical Documentation (4 items): CoC, datasheet library, RoHS/REACH, biocompatibility.
  - Processing & Fabrication (4 items): pre-drying, injection moulding parameters, cold-bending/thermoforming, adhesives.
  - Sustainability (2 items): recycled-content grades, service life.
- Added `schema.org/FAQPage` JSON-LD structured data via an inline script block — all 20 Q&As included, enabling Google rich results (FAQ accordion in SERPs).
- Built with native `<details>/<summary>` collapsible items for accessible, JavaScript-free expansion with a rotate-on-open chevron via `group-open:rotate-180`.
- Added quick-jump section nav anchors at the top of the page.
- Added a "Still have questions?" CTA panel linking to `/contact` with business hours from `siteConfig`.
- Added `/faq` to `app/sitemap.ts` (priority 0.6, monthly changeFrequency).
- Expanded Resources nav item into a dropdown with "Technical Library" and "FAQ" links in `components/navbar.tsx`.
- Build passes cleanly: 36 static/dynamic pages generated (up from 35).

Files touched:
- app/faq/page.tsx (new)
- app/sitemap.ts
- components/navbar.tsx
- PHASES.md

## Phase 33 - Homepage Newsletter Capture Strip (Completed)
Date: 2026-04-15

Goal:
- Surface the existing newsletter subscription earlier in the user journey by adding a dedicated, visually distinct section on the homepage before the CQ advisory strip.

Completed:
- Created `components/newsletter-strip.tsx` — a full-width dark-section newsletter capture component with:
  - "The Polycarbonate Industry Monthly Brief" headline and sub-copy.
  - Social-proof line ("Join 2,400+ procurement managers, OEM engineers, and fabricators").
  - Three benefit bullets: New Grade Alerts, Regulatory Updates, Technical Resources.
  - Right-side card containing `NewsletterForm` (existing client component) with privacy micro-copy below.
  - Two-column layout on large screens, stacked on mobile.
- Added `<NewsletterStrip />` to `app/page.tsx` between `<BlogTeaser />` and the CQ Advisory strip.
- Added "FAQ" to the footer company links in `components/footer.tsx` so the new FAQ page is discoverable from every page's footer.
- Re-validated production build after implementation (36 pages, no errors).

Files touched:
- components/newsletter-strip.tsx (new)
- app/page.tsx
- components/footer.tsx
- PHASES.md

## Phase 34 - Product Comparison Tool (Completed)
Date: 2026-04-15

Goal:
- Let procurement engineers compare up to 3 polycarbonate grades side-by-side in a single table view, without needing to keep multiple tabs open.

Completed:
- Created `app/products/compare/page.tsx` — fully server-rendered comparison page with:
  - URL-driven state: `/products/compare?a=slug&b=slug&c=slug` — no client state, fully shareable/bookmarkable.
  - Comparison table: header row (product name, brand, grade, in-stock badge, × remove), image row, up to 10 spec rows (only those with at least one value shown), category, certifications, industries, features, CTA row (Request Quote + Datasheet + Full details).
  - `removeSlugHref()` and `addSlugHref()` URL builders — add/remove without JS.
  - "Add a grade" section showing up to 12 addable products as thumbnail cards with "+ Add" links.
  - Empty state when no slugs provided.
  - Type-safe URL param handling (`as const` array with non-null assertion for bounded index).
- Added "Compare" text link to every product catalog card in `app/products/page.tsx`.
- Added "Compare This Grade" sidebar card to product detail pages in `app/products/[slug]/page.tsx` (between Tags and Related Technical Documents; uses existing ArrowRight import).
- Re-validated production build: 37 pages, no errors.

Files touched:
- app/products/compare/page.tsx (new)
- app/products/page.tsx
- app/products/[slug]/page.tsx
- PHASES.md

## Phase 35 - Comparison Sharing UX (Completed)
Date: 2026-04-15

Goal:
- Improve collaboration during specification reviews by making the current comparison setup easy to share as a URL.

Completed:
- Created `components/compare-share-actions.tsx` (client component) with:
  - Summary text showing how many grades are currently compared.
  - "Copy Share Link" button using `navigator.clipboard.writeText`.
  - Temporary "Copied" feedback state with icon swap.
- Integrated share actions into `app/products/compare/page.tsx` above the comparison table:
  - Generated canonical compare URL from selected product slugs (`a/b/c` params).
  - Passed path into `CompareShareActions` for one-click sharing.
- Improved readability by renaming `addablProducts` to `addableProducts`.
- Re-validated build and type health after the update (37 pages, no errors).

Files touched:
- components/compare-share-actions.tsx (new)
- app/products/compare/page.tsx
- PHASES.md

## Phase 36 - Comparison Difference Highlighting (Completed)
Date: 2026-04-15

Goal:
- Make side-by-side comparisons faster to scan by explicitly flagging rows where selected grades differ.

Completed:
- Updated `app/products/compare/page.tsx` with a reusable `hasDifferences()` helper.
- Added row-level "Diff" badges in the left label column for:
  - Technical specification rows (computed per spec key across selected products)
  - Category
  - Certifications
  - Industries
  - Key Features
- Kept comparison behavior URL-driven and server-rendered; highlighting is computed from selected products at render time.
- Re-validated type safety and production build after changes (37 pages, no errors).

Files touched:
- app/products/compare/page.tsx
- PHASES.md

## Phase 37 - Compare-Only Differences Mode (Completed)
Date: 2026-04-15

Goal:
- Let teams focus only on decision-critical variance by hiding identical rows in the comparison table when needed.

Completed:
- Added URL-driven filter state to `app/products/compare/page.tsx` using `onlydiff=1`.
- Added a toggle control above the table to switch between:
  - full comparison view
  - only-differences view
- Preserved selected grades (`a/b/c`) while toggling modes so links remain shareable and stable.
- Updated rendered rows to conditionally hide identical rows when only-differences mode is enabled:
  - specification rows
  - category, certifications, industries, key features rows
- Added an informational message when only-differences mode finds no differing rows.
- Re-validated type checks and production build after implementation (37 pages, no errors).

Files touched:
- app/products/compare/page.tsx
- PHASES.md

## Phase 38 - Product Catalog Compare Shortlist (Completed)
Date: 2026-04-15

Goal:
- Speed up compare workflows from the product catalog by letting users build a shortlist in-place before opening the comparison table.

Completed:
- Updated `app/products/page.tsx` to support URL-driven compare slots (`ca`, `cb`, `cc`) while preserving all existing catalog filters.
- Added `productsHrefWithCompare()` helper to generate stable product-list URLs with current filters + shortlist state.
- Added a new "Compare Shortlist" strip above the product grid when at least one grade is selected:
  - shows selected grades as removable chips
  - includes "Compare now" CTA to `/products/compare` with mapped `a/b/c` params
  - includes "Clear shortlist" action
- Updated each product card compare action to behave contextually:
  - "Add compare" when the grade is not in shortlist and slots are available
  - "Added" when already shortlisted (click removes)
  - fallback to "Compare" when shortlist is full
- Re-validated type checks and production build after implementation (37 pages, no errors).

Files touched:
- app/products/page.tsx
- PHASES.md

## Phase 39 - Product Detail Compare Continuity (Completed)
Date: 2026-04-15

Goal:
- Preserve compare shortlist state while users move from the catalog into individual product pages and related product exploration.

Completed:
- Created `components/compare-aware-link.tsx` to automatically carry compare shortlist params (`ca`, `cb`, `cc`) through navigation links.
- Created `components/product-compare-sidebar-card.tsx` to make the detail-page compare card shortlist-aware:
  - shows current shortlist state
  - lets the current grade be added to or removed from shortlist
  - links directly into the comparison page with mapped `a/b/c` params
- Updated `app/products/[slug]/page.tsx` to preserve shortlist context across:
  - breadcrumb link back to Products
  - category browse link in Similar Products
  - Similar Products detail links
  - back-to-products footer link
- Kept the product detail route statically generated while layering shortlist continuity through small client helpers.
- Re-validated type checks and production build after implementation (37 pages, no errors).

Files touched:
- components/compare-aware-link.tsx (new)
- components/product-compare-sidebar-card.tsx (new)
- app/products/[slug]/page.tsx
- PHASES.md

## Phase 40 - Bundled Compare Conversion Handoff (Completed)
Date: 2026-04-15

Goal:
- Convert comparison intent into a cleaner sales handoff by carrying selected product context directly into the contact flow instead of making users re-enter it manually.

Completed:
- Updated `app/products/compare/page.tsx` with compare-aware quote handoff actions:
  - added top-level "Quote These Grades" CTA near compare/share controls
  - added lower conversion panel with "Request Quote for Compared Grades"
  - passed selected compare slugs into Contact using a `compare` query param
- Updated `app/contact/page.tsx` to read quote context from URL params:
  - supports single-product requests via `product=slug`
  - supports multi-product compare requests via `compare=slug1,slug2,slug3`
  - resolves slugs into product records and shows a visible "Quote Context Loaded" summary panel above the form
  - adds a return link back to the compare page when coming from a comparison flow
- Updated `components/contact-form.tsx` to accept prefilled `initialSubject` and `initialMessage` values:
  - single-product quote flows now prefill the subject/message
  - compare-driven quote flows now prefill grouped grade names plus pricing/MOQ/lead-time prompts
- Re-validated errors and production build after implementation (37 pages, no errors).

Files touched:
- app/products/compare/page.tsx
- app/contact/page.tsx
- components/contact-form.tsx
- PHASES.md

## Phase 41 - Bundled Compare Sharing And Recall (Completed)
Date: 2026-04-15

Goal:
- Make the comparison tool easier to distribute, print, and revisit by bundling outbound sharing and recent-history recall into one pass.

Completed:
- Enhanced `components/compare-share-actions.tsx`:
  - retained copy-link behavior
  - added email-share action
  - added print / save-PDF action using the browser print dialog
- Created `components/recent-comparisons.tsx`:
  - stores recent compare setups in localStorage
  - keeps the latest 5 comparison configurations
  - exposes one-click resume links and clear-history action
- Updated `app/products/compare/page.tsx`:
  - passes selected product names into share actions for better share/email context
  - adds a print-only comparison heading for cleaner PDF/export output
  - hides non-essential controls during printing
  - renders recent comparison history below the main table area
- Re-validated file errors and production build after implementation (37 pages, no errors).

Files touched:
- components/compare-share-actions.tsx
- components/recent-comparisons.tsx (new)
- app/products/compare/page.tsx
- PHASES.md

## Phase 42 - Bundled Compare Output Refinement (Completed)
Date: 2026-04-15

Goal:
- Improve post-comparison output quality and reuse by bundling print/PDF polish, CSV export, and broader recent-comparison entry points.

Completed:
- Enhanced `components/compare-share-actions.tsx` with:
  - email-share action generated from live comparison URL
  - CSV export action for compared grades (respects only-differences mode)
  - retained copy-link and print/PDF actions
- Improved compare print/PDF readability with print-specific CSS in `app/globals.css`:
  - landscape A4 page sizing
  - normalized compare table borders/padding/text colors for hard-copy output
  - preserved legibility by flattening background utility styles in print mode
- Updated `app/products/compare/page.tsx`:
  - passes structured compare data into share/export actions
  - marks compare table/wrapper for print formatting hooks
- Expanded recent-comparison access beyond the compare page:
  - added recent-comparison resume panel on `app/products/page.tsx`
  - added recent-comparison resume panel on `app/products/[slug]/page.tsx`
- Re-validated errors and production build after implementation (37 pages, no errors).

Files touched:
- components/compare-share-actions.tsx
- app/globals.css
- app/products/compare/page.tsx
- app/products/page.tsx
- app/products/[slug]/page.tsx
- PHASES.md

## Phase 43 - Bundled Compare UX Hardening (Completed)
Date: 2026-04-15

Goal:
- Make compare state handling more resilient by normalizing malformed URL input and preserving active compare mode during product add/remove actions.

Completed:
- Updated `app/products/compare/page.tsx` to normalize query inputs:
  - deduplicates repeated compare slugs
  - skips invalid/unknown slugs safely
  - limits active compare set to 3 normalized grades
- Added user-facing normalization feedback banner when invalid or duplicate inputs are detected.
- Preserved `onlydiff=1` mode while adding/removing grades, so focused comparison mode stays active through interaction.
- Added quick reset control (`Clear Compare`) in the compare toolbar.
- Re-validated file errors and production build after implementation (37 pages, no errors).

Files touched:
- app/products/compare/page.tsx
- PHASES.md

## Phase 44 - Bundled Compare Lead Context Capture (Completed)
Date: 2026-04-15

Goal:
- Improve lead quality from compare-driven quote flows by preserving origin and compare metadata in validated contact submissions.

Completed:
- Updated `app/products/compare/page.tsx` quote links to carry explicit attribution context into Contact:
  - adds `source=compare-page`
  - preserves `onlydiff=1` when active
- Updated `app/contact/page.tsx` to build hidden provenance context for submissions:
  - derives source path (compare or product page)
  - serializes compared slugs and names
  - tracks whether only-differences mode was active
- Updated `components/contact-form.tsx` to accept and submit hidden context fields:
  - `leadSource`
  - `compareSlugs`
  - `compareNames`
  - `compareOnlyDiff`
  - `sourcePath`
- Extended `lib/schema.ts` `contactSchema` to validate the new optional context payload fields.
- Re-validated errors and production build after implementation (37 pages, no errors).

Files touched:
- app/products/compare/page.tsx
- app/contact/page.tsx
- components/contact-form.tsx
- lib/schema.ts
- PHASES.md

## Phase 45 - Bundled Quote Attribution Propagation (Completed)
Date: 2026-04-15

Goal:
- Standardize lead-source attribution across all quote entry points so CRM/webhook payloads clearly identify where quote intent originated.

Completed:
- Updated quote links in `app/products/page.tsx`:
  - catalog card quote CTA now includes `source=products-catalog-card`
  - when a compare shortlist exists, it also forwards the shortlist as `compare=...`
- Updated quote links in `app/products/[slug]/page.tsx`:
  - hero quote CTA now includes `source=product-detail-hero`
  - sidebar quote CTA now includes `source=product-detail-sidebar`
- Updated quote links in `app/products/compare/page.tsx`:
  - per-product quote buttons now include `source=compare-table-row`
  - forwards active compare set and `onlydiff=1` when applicable
- Refined `app/contact/page.tsx` hidden context generation:
  - `compareOnlyDiff` is now submitted only when compare context exists
- Re-validated file errors and production build after implementation (37 pages, no errors).

Files touched:
- app/products/page.tsx
- app/products/[slug]/page.tsx
- app/products/compare/page.tsx
- app/contact/page.tsx
- PHASES.md

## Phase 46 - Bundled CRM Attribution Enrichment (Completed)
Date: 2026-04-15

Goal:
- Improve contact lead quality for downstream CRM routing by capturing campaign attribution and deriving normalized compare-intent metadata in one pass.

Completed:
- Extended hidden context support in `components/contact-form.tsx` to include UTM fields:
  - `utmSource`
  - `utmMedium`
  - `utmCampaign`
- Extended `lib/schema.ts` `contactSchema` with validated optional UTM fields:
  - `utmSource`
  - `utmMedium`
  - `utmCampaign`
- Updated `app/contact/page.tsx` query handling to read and forward:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
- Enhanced `lib/actions.ts` `submitContactForm` payload before delivery:
  - derives `compareCount`
  - derives `hasCompareContext`
  - derives `attributionSummary` string combining source + UTM + compare mode + source path
  - sends enriched payload to both email and webhook channels
- Re-validated file errors and production build after implementation (37 pages, no errors).

Files touched:
- components/contact-form.tsx
- lib/schema.ts
- app/contact/page.tsx
- lib/actions.ts
- PHASES.md

## Phase 47 - Bundled Lead Submission Observability (Completed)
Date: 2026-04-15

Goal:
- Improve lead traceability across quote/contact/newsletter pipelines by adding consistent server-side submission metadata to all delivered lead payloads.

Completed:
- Refactored `lib/actions.ts` to use a reusable request-context helper capturing:
  - client IP
  - referer
  - user-agent
- Added reusable `withSubmissionMeta()` payload enrichment for all lead kinds:
  - `_metaLeadKind`
  - `_metaSubmissionId` (UUID-backed)
  - `_metaSubmittedAt`
  - `_metaIp`
  - `_metaReferer`
  - `_metaUserAgent`
- Applied metadata enrichment consistently to:
  - `submitQuoteRequest`
  - `submitContactForm`
  - `subscribeNewsletter`
- Preserved existing anti-spam checks and rate-limit behavior while updating key generation to use the unified request context.
- Re-validated file errors and production build after implementation (37 pages, no errors).

Files touched:
- lib/actions.ts
- PHASES.md

## Phase 48 - Bundled Lead Delivery Resilience (Completed)
Date: 2026-04-15

Goal:
- Reduce lead loss during partial downstream outages by making webhook delivery resilient while keeping primary email delivery strict and reliable.

Completed:
- Updated `lib/lead-delivery.ts` webhook delivery behavior:
  - added timeout guard using `AbortController`
  - supports configurable timeout via `CRM_WEBHOOK_TIMEOUT_MS` (default 8000ms)
  - includes response body snippet in non-OK error messages for faster diagnostics
- Updated `lib/actions.ts` lead submission flow with reusable delivery helper:
  - introduced `deliverLeadWithOptionalWebhook()`
  - email delivery remains required (throws on failure)
  - webhook delivery is now non-blocking after email success (warn logs with submission ID)
  - applied consistently to quote, contact, and newsletter actions
- Re-validated file errors and production build after implementation (37 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- lib/actions.ts
- PHASES.md

## Phase 49 - Bundled Submission Traceability UX (Completed)
Date: 2026-04-15

Goal:
- Improve post-submit traceability for operators and users by returning submission IDs to the UI and analytics while preserving resilient delivery behavior.

Completed:
- Extended `lib/actions.ts` action responses for quote/contact/newsletter to include structured success data:
  - `submissionId`
  - `webhookDelivered`
- Updated action state typing in server actions to align with enriched return payloads.
- Updated `components/contact-form.tsx`:
  - tracks submissionId/webhookDelivered in analytics event payload
  - shows submission reference ID in success UI
- Updated `components/newsletter-form.tsx`:
  - uses typed `ActionResult` state
  - tracks submissionId/webhookDelivered in analytics event payload
  - shows submission reference ID in success UI
- Re-validated errors and production build after implementation (37 pages, no errors).

Files touched:
- lib/actions.ts
- components/contact-form.tsx
- components/newsletter-form.tsx
- PHASES.md

## Phase 50 - Bundled Quote Flow Activation & Traceability Parity (Completed)
Date: 2026-04-15

Goal:
- Activate the quote-request backend path with a dedicated UI flow and bring quote submissions to parity with contact/newsletter traceability and attribution handling.

Completed:
- Added a new dedicated quote route and page:
  - `app/quote/page.tsx`
  - supports product/compare/source/utm query context
  - pre-fills request fields from selected product(s)
  - forwards hidden attribution context into form submission
- Added dedicated quote form component:
  - `components/quote-request-form.tsx`
  - wired to `submitQuoteRequest`
  - includes business-required fields + terms checkbox
  - tracks analytics with `submissionId` and `webhookDelivered`
  - shows submission reference ID in success UI
- Extended `quoteRequestSchema` in `lib/schema.ts` to validate optional attribution/context fields (parity with contact flow).
- Enhanced `submitQuoteRequest` in `lib/actions.ts`:
  - derives compare context metadata (`compareCount`, `hasCompareContext`, `attributionSummary`)
  - keeps submission meta and resilient delivery behavior
- Rerouted quote-intent CTAs from catalog/detail/compare flows to `/quote` while preserving context params.
- Added `/quote` to `app/sitemap.ts` static route entries.
- Re-validated file errors and production build after implementation (38 pages, no errors).

Files touched:
- components/quote-request-form.tsx (new)
- app/quote/page.tsx (new)
- lib/schema.ts
- lib/actions.ts
- app/products/page.tsx
- app/products/[slug]/page.tsx
- app/products/compare/page.tsx
- app/sitemap.ts
- PHASES.md

## Phase 51 - Bundled Quote Discoverability Alignment (Completed)
Date: 2026-04-15

Goal:
- Increase adoption of the dedicated quote flow by aligning global navigation and key conversion surfaces to `/quote` with explicit source attribution.

Completed:
- Updated `components/navbar.tsx` quote entry points to `/quote`:
  - top utility link (`source=navbar-utility`)
  - desktop CTA button (`source=navbar-desktop`)
  - mobile drawer CTA (`source=navbar-mobile`)
- Updated `components/footer.tsx` quote entry points to `/quote`:
  - upper CTA strip (`source=footer-cta-strip`)
  - company links quote item (`source=footer-company-links`)
- Updated `app/contact/page.tsx` header area with a direct CTA to formal quote flow:
  - `Need formal pricing? Use the Quote Form` (`source=contact-header-cta`)
- Re-validated file errors and production build after implementation (38 pages, no errors).

Files touched:
- components/navbar.tsx
- components/footer.tsx
- app/contact/page.tsx
- PHASES.md

## Phase 52 - Bundled Quote Intent CTA Consistency (Completed)
Date: 2026-04-15

Goal:
- Improve quote-flow consistency by routing remaining high-intent quote CTAs to `/quote` while preserving non-quote contact/support paths.

Completed:
- Updated featured product card quote action in `components/featured-products.tsx`:
  - `Request Quote` now routes to `/quote?product={slug}&source=featured-products`
- Updated quote-intent secondary CTAs in `components/hero.tsx`:
  - Automotive slide `Request Quote` now routes to `/quote?source=hero-automotive`
  - Commercial facades slide `Get a Quote` now routes to `/quote?source=hero-commercial`
- Intentionally left technical/support contact flows unchanged (for example: `Talk to an Expert`, `Request Safety Specs`, and generic contact CTAs).
- Re-validated file errors and production build after implementation (38 pages, no errors).

Files touched:
- components/featured-products.tsx
- components/hero.tsx
- PHASES.md

## Phase 53 - Bundled Contact CTA Source Attribution Coverage (Completed)
Date: 2026-04-15

Goal:
- Improve contact-lead attribution quality by tagging plain contact CTAs with explicit `source` values, without changing CTA intent or routing destination.

Completed:
- Added source query parameters to high-intent contact CTAs across app routes and shared surfaces:
  - FAQ CTA: `/contact?source=faq-cta`
  - Resource detail CTA: `/contact?source=resource-detail-cta`
  - Brands CTA: `/contact?source=brands-cta`
  - Applications index CTA: `/contact?source=applications-cta`
  - Application detail sidebar CTA (while preserving industry context):
    - `/contact?industry={app.id}&source=application-detail-sidebar`
  - About page hero and footer CTAs:
    - `/contact?source=about-hero`
    - `/contact?source=about-bottom-cta`
  - Homepage CQ advisory strip CTA:
    - `/contact?source=home-cq-advisory-strip`
  - Products error boundary CTA:
    - `/contact?source=products-error`
  - Products empty-state CTA:
    - `/contact?source=products-empty-state`
  - Strength callout CTA:
    - `/contact?source=strength-callout-safety-specs`
- Kept all CTAs on the contact flow (no quote-flow intent changes in this phase).
- Re-validated file errors and production build after implementation (38 pages, no errors).

Files touched:
- app/faq/page.tsx
- app/resources/[slug]/page.tsx
- app/brands/page.tsx
- app/applications/[slug]/page.tsx
- app/applications/page.tsx
- app/about/page.tsx
- app/page.tsx
- app/products/error.tsx
- app/products/page.tsx
- components/strength-callout.tsx
- PHASES.md

## Phase 54 - Bundled Paid-Click Attribution Capture (Completed)
Date: 2026-04-15

Goal:
- Improve campaign traceability for quote and contact leads by capturing paid-click identifiers and landing-path context end-to-end in form payloads and downstream delivery.

Completed:
- Extended lead input validation in `lib/schema.ts` for quote and contact flows with optional paid-click fields:
  - `gclid`
  - `msclkid`
  - `fbclid`
  - `landingPath`
- Updated attribution enrichment in `lib/actions.ts` to include the new fields in `attributionSummary` for both quote and contact submissions.
- Updated search-parameter parsing and hidden context builders in:
  - `app/contact/page.tsx`
  - `app/quote/page.tsx`
  to accept and forward:
  - `gclid`
  - `msclkid`
  - `fbclid`
  - `landing_path` (mapped into `landingPath`)
- Added hidden form inputs in:
  - `components/contact-form.tsx`
  - `components/quote-request-form.tsx`
  so paid-click and landing-path fields are reliably submitted to server actions.
- Added safe default landing-path fallback when click IDs are present and no explicit `landing_path` is supplied:
  - contact flow defaults to `/contact`
  - quote flow defaults to `/quote`
- Re-validated file diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/schema.ts
- lib/actions.ts
- app/contact/page.tsx
- app/quote/page.tsx
- components/contact-form.tsx
- components/quote-request-form.tsx
- PHASES.md

## Phase 55 - Bundled Attribution Persistence via First-Party Cookies (Completed)
Date: 2026-04-15

Goal:
- Preserve attribution context across multi-page journeys so quote/contact submissions retain campaign click identifiers even when users navigate away from the original landing URL.

Completed:
- Added root middleware in `middleware.ts` to persist attribution query parameters in first-party cookies:
  - `utm_source` -> `pc_utm_source`
  - `utm_medium` -> `pc_utm_medium`
  - `utm_campaign` -> `pc_utm_campaign`
  - `gclid` -> `pc_gclid`
  - `msclkid` -> `pc_msclkid`
  - `fbclid` -> `pc_fbclid`
  - `landing_path` -> `pc_landing_path`
- Added automatic landing-path fallback in middleware:
  - when click IDs are present but `landing_path` is absent, middleware stores the current pathname in `pc_landing_path`.
- Updated contact and quote pages to read attribution from query params first, then cookie fallbacks:
  - `app/contact/page.tsx`
  - `app/quote/page.tsx`
- Ensured hidden context passed to forms now continues to carry persisted attribution values even after internal navigation before submit.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- middleware.ts (new)
- app/contact/page.tsx
- app/quote/page.tsx
- PHASES.md

## Phase 56 - Bundled Server-Side Attribution Fallback Hardening (Completed)
Date: 2026-04-15

Goal:
- Make lead attribution resilient at submission time by resolving UTM/click context server-side from first-party cookies and request metadata when hidden fields are missing.

Completed:
- Updated `lib/actions.ts` request context handling to include cookie-derived attribution fields:
  - `utmSource`
  - `utmMedium`
  - `utmCampaign`
  - `gclid`
  - `msclkid`
  - `fbclid`
  - `landingPath`
- Added reusable fallback helpers in `lib/actions.ts`:
  - `withCookieFallback(...)` for normalized form-value-or-cookie resolution
  - `sourcePathFromReferer(...)` for deriving source path from request referer
- Hardened `submitQuoteRequest` and `submitContactForm` enrichment:
  - merges attribution fields from form data with cookie fallbacks
  - derives `sourcePath` from referer when not provided
  - updates `attributionSummary` to reflect resolved values (not just form-submitted values)
- Enhanced `subscribeNewsletter` payload enrichment:
  - adds `leadSource`, UTM/click fields, landing/source path context, and `attributionSummary`
  - preserves existing rate-limit/spam safeguards and success response contract
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/actions.ts
- PHASES.md

## Phase 57 - Bundled First-Touch Attribution Preservation (Completed)
Date: 2026-04-15

Goal:
- Preserve original acquisition context (first touch) alongside latest attribution so downstream sales and analytics can distinguish initial campaign source from later navigation touches.

Completed:
- Extended `middleware.ts` attribution persistence to maintain first-touch cookies in addition to existing last-touch cookies.
  - Existing `pc_*` cookies continue to represent last-touch values.
  - New `pc_ft_*` cookies store first-touch values and are only set when absent.
- Added first-touch landing-path handling:
  - when click IDs are present without `landing_path`, middleware still sets last-touch `pc_landing_path`
  - first-touch `pc_ft_landing_path` is set only once and preserved thereafter
- Extended `lib/actions.ts` request context to load both first-touch and last-touch attribution values from cookies.
- Added reusable `firstTouchAttributionSummary(...)` helper and included first-touch fields in lead payloads for:
  - `submitQuoteRequest`
  - `submitContactForm`
  - `subscribeNewsletter`
- Added first-touch payload fields delivered to downstream channels:
  - `firstTouchUtmSource`
  - `firstTouchUtmMedium`
  - `firstTouchUtmCampaign`
  - `firstTouchGclid`
  - `firstTouchMsclkid`
  - `firstTouchFbclid`
  - `firstTouchLandingPath`
  - `firstTouchAttributionSummary`
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- middleware.ts
- lib/actions.ts
- PHASES.md

## Phase 58 - Bundled Attribution Age Metadata (Completed)
Date: 2026-04-15

Goal:
- Add attribution timing metadata so downstream CRM workflows can evaluate recency and conversion lag using first-touch and last-touch timestamps.

Completed:
- Extended middleware attribution persistence in `middleware.ts` with timing cookies:
  - `pc_attr_first_touch_at` (set once on first tracked attribution event)
  - `pc_attr_last_touch_at` (updated on each tracked attribution event)
- Kept both timestamp cookies aligned with existing attribution persistence and click-ID landing fallback behavior.
- Extended `lib/actions.ts` request context to include attribution timing cookies.
- Added reusable helpers in `lib/actions.ts`:
  - `parseIsoDate(...)` for safe timestamp parsing
  - `conversionLagDays(...)` for normalized day-level lag calculation
- Enriched quote/contact/newsletter payloads with timing metadata:
  - `attributionFirstTouchAt`
  - `attributionLastTouchAt`
  - `attributionDaysToConversion`
- Extended attribution summary strings across lead flows to include:
  - `first_touch_at=...`
  - `last_touch_at=...`
  - `days_to_conversion=...`
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- middleware.ts
- lib/actions.ts
- PHASES.md

## Phase 59 - Bundled Organic and Referral Attribution Baseline (Completed)
Date: 2026-04-16

Goal:
- Preserve useful acquisition context for leads that arrive without explicit campaign parameters by retaining entry-path and external referrer data, then classifying the resulting traffic channel in downstream payloads.

Completed:
- Extended `middleware.ts` to seed landing-path cookies even for unattributed first visits, so direct/organic/referral sessions still retain an entry page before conversion.
- Updated tracked-attribution landing fallback behavior so any tracked attribution request without an explicit `landing_path` records the current request path as the last-touch landing path.
- Added external referrer host persistence in middleware with both last-touch and first-touch cookies:
  - `pc_referrer_host`
  - `pc_ft_referrer_host`
- Extended `lib/actions.ts` request context to load the new referrer-host cookies.
- Added attribution-channel derivation in `lib/actions.ts` across quote/contact/newsletter payloads with normalized labels:
  - `paid`
  - `email`
  - `organic`
  - `referral`
  - `direct`
- Enriched downstream lead payloads with:
  - `referrerHost`
  - `firstTouchReferrerHost`
  - `attributionChannel`
  - `firstTouchAttributionChannel`
- Extended attribution summary strings and first-touch summaries to include channel/referrer context.

Files touched:
- middleware.ts
- lib/actions.ts
- PHASES.md

## Phase 60 - Bundled CRM Attribution Normalization (Completed)
Date: 2026-04-16

Goal:
- Make downstream CRM ingestion easier by shipping a structured webhook envelope for submission and attribution data without breaking the existing flat lead payload.

Completed:
- Extended `lib/lead-delivery.ts` with structured webhook normalization helpers.
- Added additive `submission` block to webhook deliveries with:
  - `id`
  - `kind`
  - `submittedAt`
  - `ip`
  - `referer`
  - `userAgent`
- Added additive `attribution` block to webhook deliveries with normalized campaign, click-ID, landing, referrer, channel, first-touch, and timing fields.
- Preserved the original flat `payload` object in the webhook body to avoid breaking existing consumers.
- Updated `README.md` to document the CRM webhook envelope shape for future integration work.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 61 - Bundled Lead Qualification Scoring (Completed)
Date: 2026-04-16

Goal:
- Add deterministic lead qualification fields so quote, contact, and newsletter submissions reach downstream CRM systems with an immediate score, priority tier, and intent label.

Completed:
- Extended `lib/actions.ts` with reusable qualification helpers for quote, contact, and newsletter flows.
- Added additive payload fields across all lead types:
  - `leadScore`
  - `leadPriority`
  - `leadIntent`
- Incorporated qualification context into `attributionSummary` strings so flat downstream consumers can still read score and priority from existing summary handling.
- Extended `lib/lead-delivery.ts` structured webhook body with additive `qualification` block:
  - `score`
  - `priority`
  - `intent`
- Updated `README.md` to document the new qualification block and flat payload fields.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/actions.ts
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 62 - Bundled Lead Routing Segmentation (Completed)
Date: 2026-04-16

Goal:
- Turn qualification output into operational routing metadata so downstream CRM and inbox workflows know which team should own each lead and how quickly it should be handled.

Completed:
- Extended `lib/actions.ts` with reusable lead-routing derivation based on lead kind, priority, and intent.
- Added additive payload fields across all lead types:
  - `leadRoutingTeam`
  - `leadRoutingQueue`
  - `leadSlaHours`
- Included routing metadata in `attributionSummary` strings for compatibility with flat downstream consumers.
- Extended `lib/lead-delivery.ts` structured webhook body with additive `routing` block:
  - `team`
  - `queue`
  - `slaHours`
- Updated `README.md` to document the new routing block and flat payload fields.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/actions.ts
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 63 - Bundled Routed Lead Email Delivery (Completed)
Date: 2026-04-16

Goal:
- Make routing metadata operational by sending lead emails to team-specific recipients and making inbox triage easier with priority and queue-aware email subjects.

Completed:
- Extended `lib/lead-delivery.ts` to resolve email recipients from routing metadata using additive environment variables:
  - `RESEND_TO_EMAIL_SALES`
  - `RESEND_TO_EMAIL_TECHNICAL_SALES`
  - `RESEND_TO_EMAIL_MARKETING`
  - `RESEND_TO_EMAIL_HIGH_PRIORITY`
  - `RESEND_TO_EMAIL_ESCALATION`
- Preserved fallback delivery to `RESEND_TO_EMAIL` when team-specific recipients are not configured.
- Added lead email subject formatting that includes priority and queue labels for faster inbox triage.
- Updated `README.md` to document the new routing-aware email environment variables and fallback behavior.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 64 - Bundled CRM Webhook Retry and Failover (Completed)
Date: 2026-04-16

Goal:
- Improve lead-delivery reliability by retrying transient CRM webhook failures and supporting a secondary failover endpoint.

Completed:
- Extended `lib/lead-delivery.ts` webhook transport with bounded retry behavior per endpoint.
- Added configurable retry controls through environment variables:
  - `CRM_WEBHOOK_RETRIES`
  - `CRM_WEBHOOK_RETRY_BACKOFF_MS`
- Added optional endpoint failover via:
  - `CRM_WEBHOOK_FAILOVER_URL`
- Preserved existing structured webhook payload format while upgrading delivery resilience.
- Updated `README.md` environment documentation with retry/failover settings and usage notes.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 65 - Bundled Webhook Idempotency and Correlation Headers (Completed)
Date: 2026-04-16

Goal:
- Make CRM webhook retries and failover deliveries safer and easier to deduplicate by attaching stable idempotency and trace headers to each outbound request.

Completed:
- Extended `lib/lead-delivery.ts` webhook transport to emit deterministic headers per submission:
  - `Idempotency-Key` (derived from submission ID)
  - `X-Lead-Submission-Id`
  - `X-Lead-Retry-Attempt`
- Kept idempotency key stable across all retries and across failover endpoint attempts for the same lead event.
- Preserved existing retry/failover behavior and structured payload envelope from Phase 64.
- Updated `README.md` webhook documentation with the new header contract.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 66 - Bundled Webhook Signature Verification Headers (Completed)
Date: 2026-04-16

Goal:
- Improve webhook authenticity and tamper-resistance by signing outbound CRM webhook requests with a shared-secret HMAC.

Completed:
- Extended `lib/lead-delivery.ts` to support optional webhook signing via `CRM_WEBHOOK_SIGNING_SECRET`.
- Added additive verification headers when signing is enabled:
  - `X-Lead-Signature` (`v1=<hmac_sha256(timestamp.body)>`)
  - `X-Lead-Signature-Timestamp`
  - `X-Lead-Signature-Version`
- Kept existing idempotency/correlation headers and retry/failover behavior intact.
- Updated `README.md` with signing secret configuration and header verification contract.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 67 - Bundled Webhook Replay-Window Metadata (Completed)
Date: 2026-04-16

Goal:
- Improve signed webhook verification guidance by publishing a sender-side replay-window hint that downstream receivers can enforce during signature validation.

Completed:
- Extended `lib/lead-delivery.ts` signed-webhook headers with:
  - `X-Lead-Signature-Max-Age-Seconds`
- Added configurable replay-window metadata through:
  - `CRM_WEBHOOK_SIGNATURE_MAX_AGE_SECONDS` (bounded, default `300`)
- Preserved existing signing, idempotency/correlation headers, and retry/failover behavior.
- Updated `README.md` with the new environment variable and signed-header contract.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 68 - Bundled Retry Policy Hardening (Completed)
Date: 2026-04-16

Goal:
- Improve webhook reliability and error handling efficiency by retrying only transient failures while failing fast for non-recoverable responses.

Completed:
- Extended `lib/lead-delivery.ts` webhook transport with explicit retryability classification.
- Added status-aware retry policy:
  - retries on network errors, timeouts, HTTP `429`, and HTTP `5xx`
  - fails fast on non-rate-limit HTTP `4xx`
- Added jittered retry backoff to reduce synchronized retry bursts.
- Preserved existing idempotency/correlation headers, signing headers, replay-window metadata, and failover behavior.
- Updated `README.md` to document retry semantics and jitter behavior.
- Re-validated diagnostics and production build after implementation (38 pages, no errors).

Files touched:
- lib/lead-delivery.ts
- README.md
- PHASES.md

## Phase 69 - Intelligent New Picture Utilization (Completed)
Date: 2026-04-16

Goal:
- Integrate newly added photos into the highest-impact content surfaces using contextual mapping instead of generic replacements.

Completed:
- Expanded `pictureGalleryImages` in `lib/data.ts` to include newly added automotive and electronics-focused visuals so they are visible in `/gallery`.
- Improved `inferGalleryCategory(...)` logic to classify electronics/enclosure assets and material-process shots more accurately.
- Re-mapped product images to better match each SKU narrative:
  - automotive/optics grades now use BMW headlamp and body visuals
  - electronics and enclosure grades now use dedicated enclosure/electronics imagery
  - rod/resin references now use process/material closeups
- Re-mapped application and resource/blog images for stronger topical alignment (automotive, electronics, sustainability, construction energy).
- Updated hero automotive slide to use a newly added premium automotive image.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- components/hero.tsx
- PHASES.md

## Phase 70 - Visual Variety and Above-the-Fold Image Priority Tuning (Completed)
Date: 2026-04-16

Goal:
- Reduce repeated image reuse across key content surfaces and improve perceived loading speed by prioritizing only first-row images on high-traffic listing pages.

Completed:
- Reduced repeated image mapping in `lib/data.ts` by re-assigning duplicated visual slots to distinct, context-relevant assets:
  - product multiwall sheet image switched to a dedicated roofing panel visual
  - optical resin product image switched to a resin-grade visual to avoid overlap with resource cards
  - EXL copolymer image switched to a distinct automotive visual to avoid duplication with optics application
- Tuned above-the-fold image loading behavior:
  - `app/products/page.tsx`: first two product cards now use eager/high fetch priority
  - `app/resources/page.tsx`: first two resource cards now use eager/high fetch priority
  - `app/applications/page.tsx`: first two application cards now use eager/high fetch priority
- Preserved lazy loading for remaining cards to control bandwidth and avoid over-prioritization.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- app/products/page.tsx
- app/resources/page.tsx
- app/applications/page.tsx
- PHASES.md

## Phase 71 - Composition Consistency Image Pass (Completed)
Date: 2026-04-16

Goal:
- Improve visual storytelling consistency by balancing wide environment shots, close detail shots, and material/process imagery across applications and resource cards.

Completed:
- Re-mapped application visuals in `lib/data.ts` to reduce repetitive composition style:
  - construction switched to a wider terrace/canopy environment shot
  - safety switched to an industrial machine-guard use-case shot
  - consumer switched to a product-feature composition instead of another similar crop
- Re-mapped selected resource card visuals for composition variety:
  - sustainability article switched to a raw-material/process visual
  - medical guide switched to a distinct medical context visual
- Preserved all existing path validity and prior performance tuning from Phase 70.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 72 - Adjacent Visual De-Duplication on Homepage (Completed)
Date: 2026-04-16

Goal:
- Remove remaining visual collisions between hero slides and downstream homepage cards so each section contributes distinct imagery instead of repeating the same asset.

Completed:
- Updated `components/hero.tsx` slide imagery to eliminate overlap with mapped card assets:
  - material-science slide fallback image switched away from product-card duplicate
  - automotive slide image switched away from application-card duplicate
- Kept CTA structure and motion behavior unchanged while improving visual variety continuity.
- Re-validated diagnostics and production build after implementation.

Files touched:
- components/hero.tsx
- PHASES.md

## Phase 73 - Systematic Image Curation Metadata (Completed)
Date: 2026-04-16

Goal:
- Make image curation more systematic by tagging gallery assets with reusable composition metadata instead of relying only on manual one-off visual swaps.

Completed:
- Extended `lib/data.ts` gallery image model with `composition` metadata (`wide`, `detail`, `product`, `material`).
- Added metadata override support for high-signal assets so selected visuals use cleaner alt text and explicit composition/category tagging.
- Added composition inference for the wider gallery library to provide a consistent fallback classification path.
- Updated `components/pictures-mosaic.tsx` to surface composition badges alongside category badges in the visual library UI.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- components/pictures-mosaic.tsx
- PHASES.md

## Phase 74 - Balanced Gallery Sequencing (Completed)
Date: 2026-04-16

Goal:
- Use the new category/composition metadata to sequence gallery visuals more intelligently so adjacent images vary in subject and framing automatically.

Completed:
- Added transition scoring in `lib/data.ts` to prefer adjacent gallery items with different categories and different composition types.
- Added a reusable gallery balancing pass that builds a curated gallery order from the raw picture list.
- Updated `components/pictures-mosaic.tsx` to render the curated sequence instead of the raw input order.
- Preserved existing gallery metadata, badges, and loading behavior while improving visual rhythm.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- components/pictures-mosaic.tsx
- PHASES.md

## Phase 75 - Metadata-Driven Spectacular Gallery Curation (Completed)
Date: 2026-04-16

Goal:
- Extend the new gallery metadata system into the immersive homepage gallery so spotlight, tilt cards, and marquee rows are selected systematically instead of relying on hardcoded image lists.

Completed:
- Added metadata-driven showcase selection helpers in `lib/data.ts` for spotlight image, tilt cards, and marquee rows.
- Added reusable category-to-label/href mapping for gallery showcase cards.
- Updated `components/spectacular-gallery.tsx` to render spotlight, tilt cards, and marquee rows from `spectacularGalleryContent` instead of hardcoded arrays.
- Preserved the existing interactive gallery behaviors while making visual selection consistent with the broader curation system.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 76 - Homepage Showcase De-Duplication Rules (Completed)
Date: 2026-04-16

Goal:
- Prevent the immersive homepage gallery from reusing imagery already claimed by other homepage surfaces such as hero slides and teaser cards.

Completed:
- Added a homepage-reserved image exclusion set in `lib/data.ts` covering current hero and teaser-surface visuals.
- Updated metadata-driven showcase selection so spotlight, tilt cards, and marquee rows avoid reserved homepage imagery by default.
- Preserved the existing curated selection system while improving cross-section visual distinctness on the homepage.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 77 - Dynamic Homepage Exclusion Sync (Completed)
Date: 2026-04-16

Goal:
- Keep immersive homepage gallery exclusion rules automatically aligned with current homepage card selections so future content updates do not silently reintroduce duplicate visuals.

Completed:
- Refactored `lib/data.ts` to build homepage reserved gallery sources from live homepage data arrays instead of relying only on a static image list.
- Added dynamic reserved-source coverage for featured product cards, leading application cards, and blog teaser cards.
- Preserved static reserved hero/brand visuals as a fixed baseline and merged them with dynamic homepage card-derived exclusions.
- Kept existing metadata-driven spotlight/tilt/marquee selection behavior while improving long-term exclusion accuracy as data changes.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 78 - Centralized Homepage Strip Image Sources (Completed)
Date: 2026-04-16

Goal:
- Eliminate duplicate hardcoded homepage strip image sources across components and keep gallery exclusion logic synchronized with those strips through a single data source.

Completed:
- Added centralized homepage strip media exports in `lib/data.ts` for Visual Proof Strip panels and the Cinematic Band background image.
- Refactored `components/visual-proof-strip.tsx` to consume `homepageVisualProofPanels` from the data layer.
- Refactored `components/cinematic-band.tsx` to consume `homepageCinematicBandImage` from the data layer.
- Extended homepage reserved-gallery exclusion aggregation to include centralized strip image sources, reducing cross-section visual collisions.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- components/visual-proof-strip.tsx
- components/cinematic-band.tsx
- PHASES.md

## Phase 79 - Centralized Hero Slide Source of Truth (Completed)
Date: 2026-04-16

Goal:
- Remove duplicate homepage hero media definitions and make gallery exclusion derive hero sources from one canonical data export.

Completed:
- Added typed `homepageHeroSlides` export in `lib/data.ts` covering hero copy, CTA links, gradients, and media sources.
- Added `homepageHeroImageSources` export derived directly from `homepageHeroSlides`.
- Updated `components/hero.tsx` to render from `homepageHeroSlides` instead of local hardcoded slide objects.
- Refactored homepage reserved-gallery static source aggregation to use `homepageHeroImageSources`, preserving existing exclusion behavior while preventing drift.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- components/hero.tsx
- PHASES.md

## Phase 80 - Homepage Exclusion Surface Parity (Completed)
Date: 2026-04-16

Goal:
- Keep homepage gallery exclusion strict to images currently rendered on the homepage so curation avoids real duplicates without unnecessarily shrinking the available gallery pool.

Completed:
- Updated `lib/data.ts` homepage reserved section aggregation to remove application card image exclusions, because those cards are not currently rendered on the homepage.
- Preserved exclusion coverage for actual homepage image surfaces: hero slides, cinematic band, featured products, blog teasers, and visual proof strip panels.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 81 - Uncapped Homepage Exclusion Coverage (Completed)
Date: 2026-04-16

Goal:
- Ensure homepage/gallery de-duplication remains accurate as homepage lists grow by removing fixed slice caps from exclusion-source derivation.

Completed:
- Updated `lib/data.ts` homepage reserved-source aggregation to include all currently rendered featured product images rather than only the first four.
- Updated `lib/data.ts` homepage reserved-source aggregation to include all blog teaser images rather than only the first four.
- Preserved existing reserved-source coverage for hero slides, cinematic band, and visual proof strip panels.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 82 - Consolidated Reserved Source Builder (Completed)
Date: 2026-04-16

Goal:
- Reduce drift risk in homepage/gallery de-duplication by consolidating reserved-source assembly into one explicit builder.

Completed:
- Refactored `lib/data.ts` to replace split static/section reserved source assembly with a single `buildHomepageReservedGallerySources()` helper.
- Preserved the same reserved-image coverage: hero slides, cinematic band, featured products, blog teasers, and visual proof strip panels.
- Kept downstream showcase selection behavior unchanged while improving maintainability of future exclusion updates.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 83 - Reserved Source Inventory Filtering (Completed)
Date: 2026-04-16

Goal:
- Make homepage reserved-source exclusions resilient to stale or out-of-registry assets by reserving only sources that exist in the current curated gallery inventory.

Completed:
- Updated `buildHomepageReservedGallerySources()` in `lib/data.ts` to assemble candidate homepage reserved sources, then filter them against `curatedPictureGalleryItems` source inventory.
- Preserved effective exclusion behavior for all valid homepage image surfaces while removing no-op reservations for any non-gallery source drift.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 84 - Stable Showcase Fallback Selection (Completed)
Date: 2026-04-16

Goal:
- Improve metadata-driven showcase robustness by preferring non-reserved fallbacks when strict category/composition matches are exhausted.

Completed:
- Added `fallbackGalleryImage()` in `lib/data.ts` to provide deterministic fallback behavior that prefers unused matches, then category-compatible matches, then global unused sources.
- Updated spotlight fallback path to use `fallbackGalleryImage()` instead of always dropping directly to the first gallery item.
- Updated tilt card fallback path to use `fallbackGalleryImage()` for category-specific fallback while still preserving existing priority rules.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 85 - Encapsulated Showcase Build Pipeline (Completed)
Date: 2026-04-16

Goal:
- Make homepage showcase assembly easier to evolve by encapsulating spotlight/tilt/marquee selection into a single build pipeline with isolated state.

Completed:
- Refactored `lib/data.ts` to move showcase assembly into `buildSpectacularGalleryContent()`.
- Scoped `showcaseUsedImages` state inside the build pipeline so selection mutation is localized and easier to reason about.
- Preserved existing selection order and category/composition preference rules for spotlight, tilt cards, and marquee rows.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 86 - Showcase Selection Safety and Diagnostics (Completed)
Date: 2026-04-16

Goal:
- Improve resilience and observability of showcase selection with safer base fallback behavior and structured selection metrics.

Completed:
- Hardened `fallbackGalleryImage()` in `lib/data.ts` with an explicit empty-gallery guard and stable first-image fallback handling.
- Added exported `spectacularGallerySelectionDiagnostics` from `lib/data.ts` to expose reserved-source count, selected-source count, and total curated-source count.
- Preserved runtime behavior for normal non-empty gallery operation while making failure mode explicit and diagnostics queryable.
- Re-validated diagnostics and production build after implementation.

Files touched:
- lib/data.ts
- PHASES.md

## Phase 87 - Gallery Diagnostics Dev Log Wiring (Completed)
Date: 2026-04-16

Goal:
- Wire the previously exported `spectacularGallerySelectionDiagnostics` into a visible dev-mode output so the selection metrics add observable value during development.

Completed:
- Imported `spectacularGallerySelectionDiagnostics` in `app/page.tsx` (homepage server component).
- Added a `NODE_ENV !== 'production'` guard that logs a single-line gallery summary at server render time: `[Gallery] curated=N reserved=N selected=N available=N`.
- Log is suppressed in production builds; emits automatically during `next dev` and `next build` in development mode.
- Re-validated type-check and production build after implementation (38/38 pages).

Files touched:
- app/page.tsx
- PHASES.md

## Phase 88 - Blog Content Expansion (Completed)
Date: 2026-04-16

Goal:
- Expand blog content to exercise the now-uncapped blog post exclusion coverage and enrich the resources section with new articles.

Completed:
- Added blog post `b5` (slug: `pc-composite-bonnet-panels`) — PC composite bonnet panels vs. aluminium, AUTOMOTIVE category, using `/pictures/automotive-polycarbonate-bonnet-panel.jpg`.
- Added blog post `b6` (slug: `polycarbonate-electronics-fr-trends`) — FR-rated PC trends for 2026, ELECTRONICS category, using `/pictures/what-are-the-future-trends-for-polycarbonate-in-electronics-3.webp`.
- Both images sourced from the unused public/pictures pool, keeping homepage gallery exclusion logic consistent.
- Static page count increased from 38 to 40 (two new resource detail pages prerendered).
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 89 - Expanded Gallery Selection Diagnostics (Completed)
Date: 2026-04-16

Goal:
- Increase observability of homepage showcase selection quality with diagnostics that expose overlap, fallback, and marquee sufficiency.

Completed:
- Added `SpectacularGallerySelectionDiagnostics` typing in `lib/data.ts`.
- Expanded diagnostics payload to include: available source count, unused curated source count, selected-reserved overlap count, marquee target/rendered/shortfall counts, and fallback selection count.
- Kept existing exported diagnostics contract name (`spectacularGallerySelectionDiagnostics`) while extending its shape for downstream use.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 90 - Stable Marquee Fill Guarantee (Completed)
Date: 2026-04-16

Goal:
- Prevent under-filled marquee rows in low-inventory edge cases so gallery presentation remains visually stable.

Completed:
- Updated marquee sequence builder in `lib/data.ts` to recycle curated sources if needed until target row length is always met.
- Preserved existing priority order for preferred composition picks and unused-source selection before recycle fallback engages.
- Added marquee rendered/shortfall diagnostics to verify the guarantee remains healthy over future content changes.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 91 - Diagnostics Surface in Dev UI (Completed)
Date: 2026-04-16

Goal:
- Surface gallery selection diagnostics directly in development views to reduce debugging round-trips.

Completed:
- Updated `app/page.tsx` dev log to include overlap, fallback selection count, and marquee shortfall metrics.
- Added a dev-only diagnostics line in `components/spectacular-gallery.tsx` showing curated/reserved/selected/overlap/fallback and marquee rendered counts.
- Kept production output unchanged by guarding diagnostics rendering with `NODE_ENV !== 'production'`.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 92 - Gallery Diagnostics Health Scoring (Completed)
Date: 2026-04-16

Goal:
- Add an explicit quality signal to gallery diagnostics so regressions are easier to interpret than raw counts alone.

Completed:
- Extended `SpectacularGallerySelectionDiagnostics` in `lib/data.ts` with `healthStatus` and `healthNotes`.
- Added marquee uniqueness diagnostics (`marqueeUniqueSourceCount`, `marqueeDuplicateSourceCount`) to better quantify visual repetition.
- Implemented health scoring rules (`healthy`, `watch`, `degraded`) based on overlap, shortfall, fallback usage, and duplicate pressure.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 93 - Smarter Marquee Recycle Strategy (Completed)
Date: 2026-04-16

Goal:
- Reduce repeated visuals when marquee fallback recycling is required while preserving full row density.

Completed:
- Updated marquee sequence builder in `lib/data.ts` to accept avoid-sources and prioritize unseen sources before recycling.
- Added row-aware avoidance so marquee row 2 first prefers sources not already used in row 1 during recycle fallback.
- Preserved guaranteed fill behavior while improving repetition quality in constrained inventories.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 94 - Diagnostics Health Surface Expansion (Completed)
Date: 2026-04-16

Goal:
- Make health diagnostics immediately visible in development logs and UI with status-aware formatting.

Completed:
- Updated `app/page.tsx` dev log output to include `status` and marquee duplicate count metrics.
- Updated `components/spectacular-gallery.tsx` dev diagnostics strip to render status-aware color tone and inline health notes.
- Kept diagnostics display dev-only and production-safe behind existing `NODE_ENV !== 'production'` guards.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 95 - Accurate Fallback Source Accounting (Completed)
Date: 2026-04-16

Goal:
- Make fallback diagnostics precise by separating spotlight and tilt fallback usage instead of relying on a single partial counter.

Completed:
- Refactored showcase selection accounting in `lib/data.ts` to track `spotlightFallbackCount` and `tiltFallbackCount` separately.
- Updated aggregate `fallbackSelectionCount` to be derived from both counters.
- Added `marqueeRecycleCount` to capture how often marquee density relies on recycle fallback.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 96 - Diagnostics Ratio Metrics (Completed)
Date: 2026-04-16

Goal:
- Improve observability with normalized diagnostics ratios that make cross-content-state comparisons easier.

Completed:
- Added `selectionDiversityRatio` and `marqueeUniquenessRatio` to `SpectacularGallerySelectionDiagnostics` in `lib/data.ts`.
- Added ratio-based health notes and integrated threshold checks into status scoring (`watch` when diversity or uniqueness drops below target).
- Preserved existing diagnostics compatibility while extending payload with higher-signal quality metrics.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 97 - Expanded Dev Diagnostics Visibility (Completed)
Date: 2026-04-16

Goal:
- Expose the new fallback breakdown and ratio diagnostics directly in development logs and UI for faster tuning cycles.

Completed:
- Updated `app/page.tsx` dev log to include spotlight/tilt fallback split, marquee recycle count, diversity ratio, and marquee uniqueness ratio.
- Updated `components/spectacular-gallery.tsx` diagnostics strip to display fallback breakdown and ratio metrics inline.
- Kept all diagnostics output development-only and production-safe.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 98 - Tilt Category Semantics Hardening (Completed)
Date: 2026-04-16

Goal:
- Prevent category-label drift in tilt cards when fallback selection returns an image outside the intended slot category.

Completed:
- Updated tilt card assembly in `lib/data.ts` to derive card label/href from the selected image category (`image.category`) instead of always using requested slot category.
- Added `tiltCategoryMismatchCount` diagnostics to explicitly track when slot intent and selected image category diverge.
- Integrated mismatch detection into health notes and degraded health status signaling.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 99 - Category Coverage Diagnostics (Completed)
Date: 2026-04-16

Goal:
- Improve observability of showcase balance by tracking category representation across selected gallery sources.

Completed:
- Added `selectedCategoryCoverage` map and `missingSelectedCategories` list to `SpectacularGallerySelectionDiagnostics` in `lib/data.ts`.
- Computed category coverage directly from selected showcase sources with a deterministic source-to-image lookup.
- Added health notes when one or more categories are missing from the selected showcase set.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 100 - Dev Diagnostics Category Surface (Completed)
Date: 2026-04-16

Goal:
- Surface new category diagnostics in development logs/UI to accelerate quality checks during iteration.

Completed:
- Updated `app/page.tsx` dev log to include tilt mismatch count and missing-category count.
- Updated `components/spectacular-gallery.tsx` diagnostics strip to show `tiltMismatch` and list missing categories when present.
- Kept all new output gated to development mode; production output remains unchanged.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 101 - Diagnostics Alert Flag Model (Completed)
Date: 2026-04-16

Goal:
- Make diagnostics machine-actionable by adding explicit boolean alert flags instead of relying only on free-form note text.

Completed:
- Extended `SpectacularGallerySelectionDiagnostics` in `lib/data.ts` with a structured `alertFlags` object.
- Added flags for overlap, shortfall, fallback usage, duplicate pressure, tilt mismatch, missing categories, low diversity, low uniqueness, and high reserved-pressure.
- Updated health status derivation to use alert flags directly for cleaner scoring logic.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 102 - Selection Utilization Ratios (Completed)
Date: 2026-04-16

Goal:
- Improve telemetry comparability by adding normalized utilization ratios alongside absolute counts.

Completed:
- Added `reservedSourceRatio`, `selectedSourceRatio`, and `availableSourceRatio` to diagnostics in `lib/data.ts`.
- Integrated reserved-pressure threshold checks into health notes/alerts using `reservedSourceRatio`.
- Preserved existing diagnostics values while extending payload with ratio-based signals for trend tracking.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 103 - Dev Alert Surface Expansion (Completed)
Date: 2026-04-16

Goal:
- Surface the new alert/ratio telemetry directly in development logs and UI for faster triage.

Completed:
- Updated `app/page.tsx` dev logging to include utilization ratios and a compact active-alert list.
- Updated `components/spectacular-gallery.tsx` diagnostics strip to show ratio metrics and render active alert flags inline.
- Kept all new output development-only and production-safe.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 104 - Alert Priority Counters (Completed)
Date: 2026-04-16

Goal:
- Make diagnostics triage faster by exposing priority-level alert counts, not just raw boolean flags.

Completed:
- Extended `SpectacularGallerySelectionDiagnostics` in `lib/data.ts` with `activeAlertCount`, `degradedAlertCount`, and `watchAlertCount`.
- Added explicit degraded/watch alert-key groups and derived counts from active flags.
- Updated health status derivation to use aggregated priority counts (`degraded` when degraded-alert count > 0, `watch` when watch-alert count > 0).
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 105 - Overlap and Coverage Scoring (Completed)
Date: 2026-04-16

Goal:
- Improve selection quality telemetry with marquee row-overlap and category coverage scoring.

Completed:
- Added marquee row overlap metrics to diagnostics in `lib/data.ts`: `marqueeRowOverlapCount` and `marqueeRowOverlapRatio`.
- Added category coverage metrics: `coverageCategoryCount` and `categoryCoverageRatio`.
- Added new alert flags `rowOverlapHigh` and `coverageThin`, plus related health-note thresholds.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 106 - Dev Priority Surface Expansion (Completed)
Date: 2026-04-16

Goal:
- Surface priority and overlap/coverage diagnostics in development logs/UI for quicker operational diagnosis.

Completed:
- Updated `app/page.tsx` dev log to include overlap/coverage ratios and `active/degraded/watch` alert counters.
- Updated `components/spectacular-gallery.tsx` diagnostics strip to show row-overlap ratio, category coverage ratio, and alert A/D/W count summary.
- Kept all diagnostics enhancements dev-only and production-safe.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 107 - Weighted Severity Scoring (Completed)
Date: 2026-04-16

Goal:
- Convert active-alert sets into a single weighted severity score that is easier to monitor over time.

Completed:
- Extended `SpectacularGallerySelectionDiagnostics` in `lib/data.ts` with `severityScore` and `severityBand`.
- Added weighted alert scoring logic across degraded/watch flags and normalized it to a 0-100 score.
- Preserved existing health status behavior while exposing an independent severity channel (`ok`, `elevated`, `critical`).
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 108 - Prioritized Alert Topline (Completed)
Date: 2026-04-16

Goal:
- Improve triage speed by surfacing the most impactful active alerts first.

Completed:
- Added `topAlertKeys` and `alertSummary` to diagnostics in `lib/data.ts`.
- Implemented alert-key ranking using per-alert weights and exported the top 3 active signals.
- Added compact summary text describing severity band, active counts, and top-ranked alerts.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 109 - Dev Severity Surface Expansion (Completed)
Date: 2026-04-16

Goal:
- Surface severity and prioritized alerts in development outputs for faster decision-making.

Completed:
- Updated `app/page.tsx` dev logging to include severity band/score, top alert keys, and alert summary output.
- Updated `components/spectacular-gallery.tsx` diagnostics strip to show severity band/score, top alerts, and summary line.
- Kept all diagnostics output development-only and production-safe.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- PHASES.md

## Phase 110 - Diagnostics Snapshot Stability (Completed)
Date: 2026-04-16

Goal:
- Provide a stable, comparable diagnostics snapshot format for quick diffing across runs.

Completed:
- Added `snapshotKey` and `snapshotLine` to `SpectacularGallerySelectionDiagnostics` in `lib/data.ts`.
- Implemented deterministic snapshot composition using fixed-order fields and normalized ratio formatting.
- Included sorted active-alert ordering in snapshot output to reduce noisy ordering drift.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 111 - Centralized Threshold Policy (Completed)
Date: 2026-04-16

Goal:
- Centralize diagnostics threshold values for safer tuning and reduced magic-number drift.

Completed:
- Added `GALLERY_DIAGNOSTIC_THRESHOLDS` constant block in `lib/data.ts`.
- Switched alert and health-note threshold checks to use centralized constants (duplicate pressure, diversity, uniqueness, reserved pressure, row overlap, category coverage, severity critical score).
- Preserved existing diagnostics behavior while making threshold policy explicit and maintainable.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- lib/data.ts
- PHASES.md

## Phase 112 - Dev Triage UX Pass (Completed)
Date: 2026-04-16

Goal:
- Improve development triage speed with a compact severity badge and actionable next-step hint.

Completed:
- Added `triageHint` diagnostics field in `lib/data.ts` derived from active alert priority conditions.
- Updated `components/spectacular-gallery.tsx` dev diagnostics panel with severity badge, triage hint text, and snapshot line display.
- Updated `app/page.tsx` dev logs to include triage hint and stable snapshot key output.
- Re-validated type-check and production build after implementation (40/40 pages).

Files touched:
- app/page.tsx
- components/spectacular-gallery.tsx
- lib/data.ts
- PHASES.md

## Resume Instructions
When continuing in a new session:
1. Read this file first.
2. Continue from the next phase you define after this completed checkpoint.
3. Update this file at the end of each completed phase.
