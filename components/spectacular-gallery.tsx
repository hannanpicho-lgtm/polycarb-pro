'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { spectacularGalleryContent, spectacularGallerySelectionDiagnostics } from '@/lib/data';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   1. SPOTLIGHT REVEAL HEADER
   Mouse cursor becomes a circle of light that
   reveals a hidden image beneath a dark mask.
   ───────────────────────────────────────────── */

const spotlightImage = spectacularGalleryContent.spotlight;

function SpotlightReveal() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMove = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
    setPos({
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full h-[340px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden cursor-none select-none group"
    >
      {/* Base image (always visible, dimmed) */}
      <Image
      src={spotlightImage.src}
      alt={spotlightImage.alt}
        fill
        className="object-cover"
        sizes="100vw"
        loading="lazy"
      />

      {/* Dark mask with radial cut-out */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isHovering
            ? `radial-gradient(circle 140px at ${pos.x}% ${pos.y}%, transparent 0%, rgba(3,7,18,0.92) 100%)`
            : 'rgba(3,7,18,0.88)',
        }}
      />

      {/* Glowing ring around spotlight */}
      {isHovering && (
        <div
          className="absolute w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, transparent 45%, rgba(59,130,246,0.15) 50%, transparent 55%)',
          }}
        />
      )}

      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn(
            'text-white/80 text-xs font-bold uppercase tracking-[0.25em] mb-3 transition-opacity duration-500',
            isHovering && 'opacity-0'
          )}
        >
          Move your cursor to reveal
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn(
            'text-2xl sm:text-3xl lg:text-4xl font-black text-white text-center px-6 transition-opacity duration-500',
            isHovering && 'opacity-0'
          )}
        >
          See What&apos;s Possible
        </motion.h3>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. 3D TILT CARDS WITH GLARE
   Cards rotate in 3D space following the mouse,
   with a moving light-reflex glare effect.
   ───────────────────────────────────────────── */

interface TiltCardProps {
  src: string;
  alt: string;
  label: string;
  href: string;
  index: number;
}

function TiltCard({ src, alt, label, href, index }: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 250, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);

  // Glare position driven by mouse
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), springConfig);

  // Glare background – must be a top-level hook, NOT inside JSX
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.25) 0%, transparent 60%)`
  );

  const handleMove = React.useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleLeave = React.useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-xl overflow-hidden cursor-pointer group"
      >
        <Link href={href} className="block relative aspect-[3/4] sm:aspect-[4/5]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />

          {/* Animated glare overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: glareBackground }}
          />

          {/* Bottom gradient + label */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-4" style={{ transform: 'translateZ(30px)' }}>
            <span className="text-white font-bold text-base drop-shadow-lg">{label}</span>
            <span className="block text-brand-400 text-[11px] font-semibold mt-0.5 group-hover:translate-x-1.5 transition-transform duration-300">
              Explore →
            </span>
          </div>

          {/* Border glow on hover */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-brand-400/30 transition-colors duration-500 pointer-events-none" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

const tiltCards = spectacularGalleryContent.tilt;

/* ─────────────────────────────────────────────
   3. INFINITE MARQUEE
   Two rows of images scrolling in opposite
   directions. Pauses on hover.
   ───────────────────────────────────────────── */

const marqueeItems = spectacularGalleryContent.marquee;
const marqueeRow1 = marqueeItems
  .filter((_, index) => index % 2 === 0);
const marqueeRow2 = marqueeItems
  .filter((_, index) => index % 2 === 1);

const galleryDiagnostics = spectacularGallerySelectionDiagnostics;
const diagnosticsToneClass =
  galleryDiagnostics.healthStatus === 'healthy'
    ? 'text-emerald-300/90'
    : galleryDiagnostics.healthStatus === 'watch'
    ? 'text-amber-300/90'
    : 'text-rose-300/90';
const severityBadgeClass =
  galleryDiagnostics.severityBand === 'ok'
    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
    : galleryDiagnostics.severityBand === 'elevated'
    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
    : 'bg-rose-500/20 text-rose-200 border-rose-400/40';

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: Array<{ src: string; alt: string; label: string; href: string }>;
  reverse?: boolean;
}) {
  // Double the array so the loop is seamless
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden group/marquee [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div
        className={cn(
          'flex gap-6 w-max will-change-transform',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          'group-hover/marquee:[animation-play-state:paused]'
        )}
      >
        {doubled.map((item, i) => (
          <Link
            key={`${item.src}-${i}`}
            href={item.href}
            aria-label={`${item.label} — explore application`}
            className="relative flex-shrink-0 w-[280px] sm:w-[320px] h-[190px] sm:h-[220px] rounded-xl overflow-hidden group/tile ring-1 ring-white/10 hover:ring-brand-400/60 shadow-lg shadow-black/30 transition-all duration-500"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover group-hover/tile:scale-[1.08] transition-transform duration-[900ms] ease-out"
              sizes="(min-width: 640px) 320px, 280px"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white pointer-events-none">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-300/90">
                {item.label}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-white/90">
                <span className="truncate">Explore application</span>
                <span
                  aria-hidden
                  className="inline-block translate-x-0 opacity-70 transition-all duration-300 group-hover/tile:translate-x-1 group-hover/tile:opacity-100"
                >
                  →
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT — Spectacular Gallery
   ───────────────────────────────────────────── */

export function SpectacularGallery() {
  return (
    <section className="py-20 bg-steel-950 overflow-hidden">
      {process.env.NODE_ENV !== 'production' && (
        <div className="container mx-auto mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide', severityBadgeClass)}>
              {galleryDiagnostics.severityBand.toUpperCase()} {galleryDiagnostics.severityScore}
            </span>
            <span className="text-[10px] sm:text-[11px] text-white/70 font-mono">{galleryDiagnostics.triageHint}</span>
          </div>
          <p className={cn('text-[11px] sm:text-xs font-mono tracking-wide', diagnosticsToneClass)}>
            Gallery diagnostics: curated {galleryDiagnostics.totalCuratedSourceCount} | reserved{' '}
            {galleryDiagnostics.reservedSourceCount} | selected {galleryDiagnostics.selectedSourceCount} | overlap{' '}
            {galleryDiagnostics.selectedReservedOverlapCount} | fallback {galleryDiagnostics.fallbackSelectionCount} (spotlight{' '}
            {galleryDiagnostics.spotlightFallbackCount}, tilt {galleryDiagnostics.tiltFallbackCount}) | recycle{' '}
            {galleryDiagnostics.marqueeRecycleCount} | marquee {galleryDiagnostics.marqueeRenderedCount}/
            {galleryDiagnostics.marqueeTargetCount} | duplicates {galleryDiagnostics.marqueeDuplicateSourceCount} |
            tiltMismatch {galleryDiagnostics.tiltCategoryMismatchCount} | diversity {galleryDiagnostics.selectionDiversityRatio} |
            uniqueness {galleryDiagnostics.marqueeUniquenessRatio} | reservedRatio {galleryDiagnostics.reservedSourceRatio} |
            selectedRatio {galleryDiagnostics.selectedSourceRatio} | availableRatio {galleryDiagnostics.availableSourceRatio} |
            rowOverlapRatio {galleryDiagnostics.marqueeRowOverlapRatio} | categoryCoverageRatio {galleryDiagnostics.categoryCoverageRatio} |
            alerts A/D/W {galleryDiagnostics.activeAlertCount}/{galleryDiagnostics.degradedAlertCount}/
            {galleryDiagnostics.watchAlertCount} |
            severity {galleryDiagnostics.severityBand}:{galleryDiagnostics.severityScore} |
            status {galleryDiagnostics.healthStatus}
          </p>
          {galleryDiagnostics.topAlertKeys.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-fuchsia-200/80 font-mono mt-1">
              Top alerts: {galleryDiagnostics.topAlertKeys.join(', ')}
            </p>
          )}
          {Object.values(galleryDiagnostics.alertFlags).some(Boolean) && (
            <p className="text-[10px] sm:text-[11px] text-rose-200/80 font-mono mt-1">
              Active alerts:{' '}
              {Object.entries(galleryDiagnostics.alertFlags)
                .filter(([, isActive]) => isActive)
                .map(([key]) => key)
                .join(', ')}
            </p>
          )}
          {galleryDiagnostics.missingSelectedCategories.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-amber-200/80 font-mono mt-1">
              Missing categories in selection: {galleryDiagnostics.missingSelectedCategories.join(', ')}
            </p>
          )}
          {galleryDiagnostics.healthNotes.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-white/60 font-mono mt-1">
              {galleryDiagnostics.healthNotes.join(' | ')}
            </p>
          )}
          <p className="text-[10px] sm:text-[11px] text-white/50 font-mono mt-1">{galleryDiagnostics.alertSummary}</p>
          <p className="text-[10px] sm:text-[11px] text-white/40 font-mono mt-1">{galleryDiagnostics.snapshotLine}</p>
        </div>
      )}
      <div className="container mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="tag-pill bg-brand-500 text-white mb-3 inline-block">IMMERSIVE GALLERY</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">Experience the Material</h2>
          <p className="text-white/45 text-sm mt-2 max-w-xl mx-auto">
            Interactive visuals. Real-world applications. Hover, explore, and discover what polycarbonate makes possible.
          </p>
        </motion.div>

        {/* Spotlight reveal */}
        <SpotlightReveal />
      </div>

      {/* 3D Tilt Cards */}
      <div className="container mx-auto mb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tiltCards.map((card, i) => (
            <TiltCard key={card.label} {...card} index={i} />
          ))}
        </div>
      </div>

      {/* Infinite marquee rows */}
      <div className="space-y-4">
        <MarqueeRow items={marqueeRow1} />
        <MarqueeRow items={marqueeRow2} reverse />
      </div>

      {/* CTA */}
      <div className="container mx-auto mt-12 text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded transition-colors text-sm"
        >
          View Full Gallery
        </Link>
      </div>
    </section>
  );
}
