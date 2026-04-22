'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { homepageVisualProofPanels } from '@/lib/data';

export function VisualProofStrip() {
  return (
    <section className="py-14 bg-steel-950">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="tag-pill bg-brand-500 text-white mb-3 inline-block">IN THE FIELD</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Material Meets Application</h2>
          <p className="text-white/50 text-sm mt-2 max-w-xl mx-auto">
            Supercars, luxury patios, commercial canopies — see the material performing where it matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {homepageVisualProofPanels.map((panel, i) => (
            <motion.div
              key={panel.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link
                href={panel.href}
                className="group relative block aspect-[4/3] rounded-lg overflow-hidden"
              >
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <span className="text-white font-bold text-lg tracking-tight">{panel.label}</span>
                  <span className="block text-brand-400 text-xs font-semibold mt-0.5 group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
