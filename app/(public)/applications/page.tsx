import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Car, Building2, Stethoscope, Cpu, Lightbulb, ShieldCheck } from 'lucide-react';
import { applications } from '@/lib/data';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Applications & Industries',
  description:
    'Polycarbonate solutions for automotive, construction, medical, electronics, optics, and safety applications. Discover how PC materials perform in your industry.',
};

const iconMap: Record<string, React.ElementType> = {
  Car, Building2, Stethoscope, Cpu, Lightbulb, ShieldCheck,
};

export default function ApplicationsPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-steel-950 pt-28 pb-14">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">Industries We Serve</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 font-display">
            Where Our Materials Perform
          </h1>
          <p className="text-white/60 text-base max-w-2xl leading-relaxed">
            Automotive lightweighting, biocompatible medical housings, architectural glazing — polycarbonate engineered for the challenges that matter most.
          </p>
        </div>
      </div>

      {/* Applications grid */}
      <div className="bg-background py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {applications.map((app, i) => {
              const Icon = iconMap[app.icon] ?? Car;
              return (
                <article
                  key={app.id}
                  className="group flex flex-col sm:flex-row gap-0 border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
                >
                  {/* Image side */}
                  <div className="relative sm:w-56 flex-shrink-0 aspect-[4/3] sm:aspect-auto overflow-hidden bg-muted">
                    <Image
                      src={app.image}
                      alt={app.title}
                      fill
                      loading={i < 2 ? 'eager' : 'lazy'}
                      fetchPriority={i < 2 ? 'high' : 'auto'}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 224px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                  </div>

                  {/* Text side */}
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
                      </div>
                      <h2 className="font-bold text-xl text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {app.title}
                      </h2>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      {app.subtitle}
                    </p>

                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {app.description}
                    </p>

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-1.5 my-4">
                      {app.benefits.map((b) => (
                        <span key={b} className="text-[11px] bg-muted text-muted-foreground px-2 py-1 rounded">
                          {b}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/applications/${app.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors group-hover:gap-3 duration-200"
                    >
                      Explore solutions <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-muted/40 py-14">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Don't see your industry?</h2>
          <p className="text-muted-foreground text-sm mb-7 max-w-md mx-auto">
            Our applications engineers work with customers in over 30 industry segments. Get in touch and we'll identify the right PC grade for your requirements.
          </p>
          <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
            <Link href="/contact?source=applications-cta">Talk to an Applications Engineer</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
