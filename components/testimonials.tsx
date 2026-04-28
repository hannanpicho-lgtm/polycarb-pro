'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '@/lib/data';

export function Testimonials() {
  const [current, setCurrent] = React.useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section
      className="py-20 bg-steel-950 relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            Customer Success
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            Trusted by Industry Leaders
          </h2>
        </div>

        {/* All testimonials desktop grid */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.15 }}
              className="bg-white/5 border border-white/10 rounded-lg p-7 backdrop-blur-sm"
            >
              <Quote className="h-8 w-8 text-brand-400 mb-4 opacity-80" aria-hidden="true" />
              <Stars count={t.rating} />
              <blockquote className="text-white/80 text-sm leading-relaxed mt-4 mb-6 italic">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-400 font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/50 text-xs">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden">
          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="bg-white/5 border border-white/10 rounded-lg p-7"
              >
                <Quote className="h-8 w-8 text-brand-400 mb-4 opacity-80" aria-hidden="true" />
                <Stars count={testimonials[current]!.rating} />
                <blockquote className="text-white/80 text-sm leading-relaxed mt-4 mb-6 italic">
                  "{testimonials[current]!.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-400 font-bold text-sm">
                    {testimonials[current]!.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {testimonials[current]!.name}
                    </p>
                    <p className="text-white/50 text-xs">
                      {testimonials[current]!.title}, {testimonials[current]!.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-brand-400 w-6' : 'bg-white/30'}`}
              />
            ))}
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? 'fill-brand-400 text-brand-400' : 'text-white/20'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
