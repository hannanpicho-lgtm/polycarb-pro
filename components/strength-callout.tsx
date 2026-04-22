'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Hammer, Drill } from 'lucide-react';
import { ViewportVideo } from '@/components/viewport-video';

const proofPoints = [
  {
    icon: Hammer,
    label: 'Sledgehammer tested',
    desc: 'Full-swing impact on a commercial-grade installed panel — no crack, no shatter.',
  },
  {
    icon: Drill,
    label: 'Field machinable',
    desc: 'Drills cleanly without special tooling. Ready to install the same day you receive it.',
  },
  {
    icon: ShieldCheck,
    label: 'IK10 / EN 356 rated',
    desc: 'Certified for anti-vandal and attack-resistant glazing up to P8B classification.',
  },
];

export function StrengthCallout() {
  return (
    <section
      className="relative overflow-hidden bg-steel-950"
      aria-labelledby="strength-callout-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
        {/* Video panel — left on large screens */}
        <div className="relative order-2 lg:order-1 min-h-[280px] lg:min-h-0">
          <ViewportVideo
            mp4Src="/videos/strength-commercial.mp4"
            webmSrc="/videos/strength-commercial.webm"
            poster="/video-posters/strength-commercial.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Right-side fade to dark panel */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent to-steel-950/50 hidden lg:block"
            aria-hidden="true"
          />
        </div>

        {/* Content panel — right */}
        <div className="order-1 lg:order-2 flex flex-col justify-center px-8 py-14 lg:px-16 bg-steel-950">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand-400 mb-3 block">
              Commercial-Grade Strength
            </span>
            <h2
              id="strength-callout-heading"
              className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 font-display"
            >
              Tested where it matters. <br className="hidden sm:block" />
              Proven where it counts.
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed mb-8 max-w-md">
              Full-force sledgehammer blows on installed commercial glazing — zero cracks.
              Watch the test, then spec the material.
            </p>

            {/* Proof points */}
            <ul className="space-y-5 mb-10">
              {proofPoints.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-brand-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-0.5">{label}</p>
                    <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact?source=strength-callout-safety-specs"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold px-6 py-3 rounded text-sm"
              >
                Request Safety Specs
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 transition-colors text-white/80 hover:text-white font-semibold px-6 py-3 rounded text-sm"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
