'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { brands } from '@/lib/data';

export function BrandsGrid() {
  return (
    <section className="py-20 bg-muted/40" aria-labelledby="brands-heading">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">
            Authorised Distributor
          </p>
          <h2 id="brands-heading" className="section-heading">
            World-Leading PC Brands
          </h2>
          <p className="section-subheading mx-auto mt-3">
            Direct partnerships with the world's top polycarbonate producers ensure competitive
            pricing, genuine material, and full technical documentation.
          </p>
        </div>

        {/* Brand logo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="group flex flex-col items-center justify-center gap-3 p-5 bg-background border border-border rounded-lg hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-300 cursor-default"
            >
              <div className="w-14 h-14 rounded-lg bg-white dark:bg-steel-900 border border-border flex items-center justify-center p-2 transition-transform group-hover:scale-105">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground leading-tight">
                  {brand.name.split('–')[1]?.trim() ?? brand.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{brand.country}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded bg-white dark:bg-steel-900 border border-border flex items-center justify-center p-1.5">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{brand.name}</h3>
                  <p className="text-xs text-muted-foreground">{brand.country}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {brand.description}
              </p>
              {brand.flagshipSeries ? (
                <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mb-3">
                  Flagship: {brand.flagshipSeries}
                </p>
              ) : null}
              {brand.specialties?.length ? (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {brand.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="text-[10px] px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800/60 bg-brand-50/70 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                {brand.grades.slice(0, 3).map((grade) => (
                  <span
                    key={grade}
                    className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono"
                  >
                    {grade}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
