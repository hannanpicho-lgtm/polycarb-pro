'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { homepageCinematicBandImage } from '@/lib/data';

export function CinematicBand() {
  return (
    <section className="relative h-[420px] lg:h-[480px] overflow-hidden">
      {/* Background image with fixed attachment for parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${homepageCinematicBandImage}')` }}
        role="img"
        aria-label="Polycarbonate sunroom and pergola installation"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-steel-950/85 via-steel-950/60 to-steel-950/85" />

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <span className="tag-pill bg-brand-500 text-white mb-4 inline-block">PROVEN PERFORMANCE</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 font-display">
              80+ years of service life.<br />Six continents. Zero compromises.
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed mb-7 max-w-md">
              Residential sunrooms to stadium skylights — polycarbonate outperforms glass in weight, impact resistance, thermal insulation, and UV stability.
            </p>
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded transition-colors text-sm"
            >
              Explore Applications
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
