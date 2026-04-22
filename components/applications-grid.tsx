'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Car, Building2, Stethoscope, Cpu, Lightbulb, ShieldCheck, Leaf, Package } from 'lucide-react';
import { applications, products } from '@/lib/data';

const iconMap: Record<string, React.ElementType> = {
  Car,
  Building2,
  Stethoscope,
  Cpu,
  Lightbulb,
  ShieldCheck,
  Leaf,
  Package,
};

const accentColors = [
  'border-orange-400 bg-orange-50 dark:bg-orange-950/30',
  'border-blue-400 bg-blue-50 dark:bg-blue-950/30',
  'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
  'border-violet-400 bg-violet-50 dark:bg-violet-950/30',
  'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30',
  'border-red-400 bg-red-50 dark:bg-red-950/30',
];

const iconColors = [
  'text-orange-500',
  'text-blue-500',
  'text-emerald-500',
  'text-violet-500',
  'text-cyan-500',
  'text-red-500',
];

export function ApplicationsGrid() {
  return (
    <section className="py-20 bg-muted/40" aria-labelledby="applications-heading">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Industries We Serve</p>
          <h2 id="applications-heading" className="section-heading">
            Where Polycarbonate Performs
          </h2>
          <p className="section-subheading mx-auto mt-3">
            From laboratory-grade optical components to large-scale architectural glazing, our material portfolio
            covers every performance envelope.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.map((app, i) => {
            const Icon = iconMap[app.icon] ?? Package;
            const accentClass = accentColors[i % accentColors.length]!;
            const iconClass = iconColors[i % iconColors.length]!;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
              >
                <Link
                  href={`/applications/${app.slug}`}
                  className={`group flex flex-col h-full rounded border-l-4 ${accentClass} border-border p-6 hover:shadow-md transition-all duration-300`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-5 shadow-sm border border-border group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
                  </div>

                  {/* Text */}
                  <h3 className="font-bold text-lg text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">
                    {app.title}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {app.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {app.description.slice(0, 140)}…
                  </p>

                  {/* Product thumbnails */}
                  <div className="mt-6">
                    <div className="grid grid-cols-3 gap-2">
                      {products
                        .filter((product) => app.products.includes(product.id))
                        .slice(0, 3)
                        .map((product) => (
                          <div key={product.id} className="relative h-20 overflow-hidden rounded-xl border border-border bg-muted">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover object-center"
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.min(app.products.length, 3)} product images shown</span>
                      <span className="font-semibold text-foreground">{app.products.length} grades</span>
                    </div>
                  </div>

                  {/* Read more */}
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-3 transition-all duration-200">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
