'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Thermometer, Eye, Recycle, Layers } from 'lucide-react';
import { ViewportVideo } from '@/components/viewport-video';

const benefits = [
  {
    icon: ShieldCheck,
    title: '250× Impact Resistance vs. Glass',
    description:
      'Polycarbonate withstands heavy impacts without shattering, making it the material of choice for safety glazing, machine guards, and ballistic-resistant panels.',
    stat: '250×',
    statLabel: 'vs. standard glass',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Eye,
    title: 'Up to 92% Light Transmittance',
    description:
      "Optical-grade PC matches glass in clarity while offering design flexibility impossible with inorganic substrates. Ideal for lenses, diffusers, and light guides.",
    stat: '92%',
    statLabel: 'light transmittance',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  {
    icon: Zap,
    title: '50% Lighter Than Equivalent Glass',
    description:
      'At 1.2 g/cm³, polycarbonate enables dramatic weight reductions in automotive, aerospace, and architectural applications without sacrificing structural integrity.',
    stat: '50%',
    statLabel: 'weight reduction',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: Thermometer,
    title: 'Service Range –40 °C to +135 °C',
    description:
      'Engineered thermoplastic formulations maintain functionality across extreme thermal environments, from sub-Arctic installations to automotive underhood conditions.',
    stat: '175°C',
    statLabel: 'max HDT (high-heat grades)',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    icon: Layers,
    title: 'Design Freedom & Formability',
    description:
      'PC sheets thermoform easily at 160–190 °C, and resins injection-mold into precision thin-wall geometries. Complex integrated functions reduce part counts.',
    stat: '1 mm',
    statLabel: 'minimum wall thickness',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Recycle,
    title: 'Increasingly Circular Material',
    description:
      'Chemical recycling and bio-based BPA monomers are reshaping PC sustainability. Many grades now carry recycled content without compromising performance.',
    stat: '100%',
    statLabel: 'chemically recyclable',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

const technicalSpecs = [
  { property: 'Density', value: '1.20 g/cm³' },
  { property: 'Tensile Strength', value: '55–100 MPa' },
  { property: 'Flexural Modulus', value: '2,300–7,200 MPa' },
  { property: 'Notched Izod Impact', value: 'No break – 850 J/m' },
  { property: 'Heat Deflection Temp.', value: '118–163 °C' },
  { property: 'Light Transmittance', value: 'Up to 92%' },
  { property: 'UV Resistance', value: 'Co-extruded UV layers available' },
  { property: 'Flammability', value: 'UL 94 HB to V-0' },
];

export function WhyPolycarbonate() {
  return (
    <section className="py-20 bg-background" aria-labelledby="why-pc-heading">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Material Science</p>
          <h2 id="why-pc-heading" className="section-heading">
            Why Polycarbonate?
          </h2>
          <p className="section-subheading mx-auto mt-3">
            Six decades of engineering innovation have made polycarbonate the transparent engineering thermoplastic of
            choice across the most demanding global industries.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
                className={`rounded-lg p-6 ${benefit.bg} border border-border`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex-shrink-0 ${benefit.color}`}>
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl font-black ${benefit.color}`}>{benefit.stat}</span>
                      <span className="text-xs text-muted-foreground">{benefit.statLabel}</span>
                    </div>
                    <h3 className="font-bold text-base text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Video proof block */}
        <div className="mb-16 rounded-2xl overflow-hidden border border-border bg-steel-950 dark:bg-steel-950 grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
          {/* Video panel */}
          <div className="relative overflow-hidden min-h-[320px] lg:min-h-0">
            <ViewportVideo
              mp4Src="/videos/proof-pc-vs-glass.mp4"
              webmSrc="/videos/proof-pc-vs-glass.webm"
              poster="/video-posters/proof-pc-vs-glass.jpg"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-steel-950/60 hidden lg:block" aria-hidden="true" />
          </div>
          {/* Text panel */}
          <div className="flex flex-col justify-center px-8 py-10 lg:px-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">Proof, Not Claims</span>
            <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-4">
              The demonstration that speaks louder than any datasheet
            </h3>
            <ul className="space-y-3 text-[15px] text-white/70 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400" aria-hidden="true" />
                Bricks stacked directly on polycarbonate — zero cracks, zero deflection
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400" aria-hidden="true" />
                Glass dropped the same distance: shatters on impact into dust
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400" aria-hidden="true" />
                250× impact resistance vs. standard glass — this is what it looks like in practice
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400" aria-hidden="true" />
                Lighter, cheaper to ship, and survives conditions that destroy alternatives
              </li>
            </ul>
          </div>
        </div>

        {/* Technical spec table */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center font-bold text-xl mb-6 text-foreground">
            Typical Property Ranges Across Our Portfolio
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm" aria-label="Polycarbonate typical properties">
              <thead>
                <tr className="bg-brand-500 text-white">
                  <th className="text-left px-5 py-3 font-semibold">Property</th>
                  <th className="text-left px-5 py-3 font-semibold">Typical Range</th>
                </tr>
              </thead>
              <tbody>
                {technicalSpecs.map((spec, i) => (
                  <tr
                    key={spec.property}
                    className={i % 2 === 0 ? 'bg-background' : 'bg-muted/40'}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{spec.property}</td>
                    <td className="px-5 py-3 text-muted-foreground font-mono">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Values are indicative across our standard portfolio. Contact us for grade-specific datasheets.
          </p>
        </div>
      </div>
    </section>
  );
}
