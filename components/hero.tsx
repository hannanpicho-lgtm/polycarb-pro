'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleDots } from '@/components/particle-dots';
import { homepageHeroSlides } from '@/lib/data';
import { cn } from '@/lib/utils';

export function Hero() {
  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % homepageHeroSlides.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + homepageHeroSlides.length) % homepageHeroSlides.length);
  const next = () => setCurrent((c) => (c + 1) % homepageHeroSlides.length);

  const slide = homepageHeroSlides[current]!;

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-16"
      aria-label="Hero banner"
    >
      {/* Background image layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          {'video' in slide && slide.video ? (
            <video
              poster={'videoPoster' in slide ? (slide.videoPoster as string) : undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover object-center"
            >
              {'videoWebm' in slide && slide.videoWebm ? (
                <source src={slide.videoWebm as string} type="video/webm" />
              ) : null}
              <source src={slide.video} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={slide.image}
              alt=""
              fill
              priority={current === 0}
              fetchPriority={current === 0 ? 'high' : 'auto'}
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r',
              slide.bgClass,
              'video' in slide && slide.video ? 'opacity-50' : 'opacity-65'
            )}
          />
          {/* Extra bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Particle dots – left side decoration */}
      <motion.div
        className="absolute left-0 top-24 w-[34%] max-w-lg opacity-60 hidden lg:block pointer-events-none z-10"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 0.46, x: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <ParticleDots className="w-full h-auto drop-shadow-[0_10px_22px_rgba(16,36,54,0.26)]" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto relative z-20 py-20">
        <div className="max-w-2xl ml-auto lg:ml-[45%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Category tag */}
              <span className="inline-block bg-brand-500 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm">
                {slide.tag}
              </span>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight font-display">
                {slide.headline}
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-white/75 leading-relaxed max-w-md">
                {slide.subheadline}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/30"
                >
                  <Link href={slide.cta.href}>{slide.cta.label}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:border-white/70"
                >
                  <Link href={slide.secondaryCta.href}>{slide.secondaryCta.label}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slideshow controls */}
      <div className="absolute bottom-8 inset-x-0 z-30">
        <div className="container mx-auto flex items-center justify-end gap-3">
          {/* Dots */}
          <div className="flex items-center gap-2 mr-2" aria-label="Slide indicators">
            {homepageHeroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === current
                    ? 'w-7 h-2.5 bg-brand-400'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>

          {/* Prev / Pause-Play / Next */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white/70 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white/70 transition-colors"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white/70 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
