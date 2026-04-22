'use client';

import { motion } from 'framer-motion';
import { brands } from '@/lib/data';

export function BrandsGrid() {
  return (
    <section className="py-20 bg-muted/40" aria-labelledby="brands-heading">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Authorised Distributor</p>
          <h2 id="brands-heading" className="section-heading">
            World-Leading PC Brands
          </h2>
          <p className="section-subheading mx-auto mt-3">
            Direct partnerships with the world's top polycarbonate producers ensure competitive pricing,
            genuine material, and full technical documentation.
          </p>
        </div>

        {/* Brand card grid */}
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
              {/* Logo placeholder with brand initial */}
              <div className="w-14 h-14 rounded-full bg-steel-100 dark:bg-steel-800 flex items-center justify-center text-2xl font-black text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 transition-colors">
                {brand.name.charAt(0)}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground leading-tight">{brand.name.split('–')[1]?.trim() ?? brand.name}</p>
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
                <div className="w-10 h-10 rounded bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-lg font-black text-brand-500">
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{brand.name}</h3>
                  <p className="text-xs text-muted-foreground">{brand.country}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{brand.description}</p>
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
