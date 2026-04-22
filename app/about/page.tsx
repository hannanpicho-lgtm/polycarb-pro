import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Globe, Award, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicationsGrid } from '@/components/applications-grid';
import { WhyPolycarbonate } from '@/components/why-polycarbonate';
import { BrandsGrid } from '@/components/brands-grid';
import { Testimonials } from '@/components/testimonials';
import { siteConfig } from '@/lib/site-config';
import { applications, brands, products } from '@/lib/data';

export const metadata: Metadata = {
  title: `About ${siteConfig.company.shortName}`,
  description:
    `${siteConfig.company.name} is a specialist supplier of premium polycarbonate sheets, rods, and resins, supporting global OEM and fabrication teams since ${siteConfig.company.foundedYear}.`,
};

const yearsInBusiness = new Date().getFullYear() - siteConfig.company.foundedYear;

const stats = [
  { value: `${yearsInBusiness}+`, label: 'Years in business' },
  { value: `${products.length}+`, label: 'Products in portfolio' },
  { value: `${brands.length}`, label: 'Brand partnerships' },
  { value: `${applications.length}+`, label: 'Application sectors' },
];

const values = [
  {
    icon: CheckCircle2,
    title: 'Material Authenticity',
    description: 'Every product ships with full Certificate of Conformance and traceable lot documentation from the original manufacturer.',
  },
  {
    icon: Globe,
    title: 'Global Logistics Network',
    description: 'Warehousing in North America, Europe, and Asia-Pacific ensures fast local delivery with competitive lead times.',
  },
  {
    icon: Award,
    title: 'Technical Excellence',
    description: 'Our applications engineers hold degrees in polymer science and materials engineering — not just sales experience.',
  },
  {
    icon: Users,
    title: 'Long-term Partnerships',
    description: 'We maintain dedicated stock programs and blanket orders for high-volume customers to eliminate supply risk.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-steel-950 pt-28 pb-16">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">About Us</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-5 max-w-2xl font-display">
            Two Decades of Polycarbonate Expertise
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            {siteConfig.company.name} was founded in {siteConfig.company.foundedYear} with a clear mission: deliver genuinely high-performance polycarbonate
            materials backed by real technical support. We focus on practical grade selection, dependable lead times,
            and transparent technical documentation for every shipment.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
              <Link href="/contact?source=about-hero">Get in Touch</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/products">Explore Products</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-brand-500 py-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-white/70 text-xs uppercase tracking-widest font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our values */}
      <div className="bg-background py-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3 font-display">What Sets Us Apart</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              We've built our reputation on non-negotiable quality standards, deep technical knowledge, and supply-chain reliability our customers can plan around.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="flex gap-5 p-6 border border-border rounded-lg">
                  <Icon className="h-7 w-7 text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our story — Strategic Innovation Section */}
      <div className="bg-muted/40 py-16">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-5 font-display">Strategic Innovation Driving Industrial Transformation</h2>
          <div className="prose prose-sm text-muted-foreground max-w-none space-y-5">
            <p>
              Since 2003, {siteConfig.company.name} has advanced polycarbonate as a strategic material enabling the technologies shaping tomorrow's industries. More than a chemical company, {siteConfig.company.name} is a technical partner translating material innovation into measurable industrial impact.
            </p>
            <p>
              Polycarbonate's unique balance of optical clarity, mechanical strength, and lightweight properties is fundamental to sectors in rapid transformation: electric mobility, smart infrastructure, medical devices, and precision electronics. These aren't theoretical applications—they represent proven, expanding markets built on advanced material science and demonstrated performance.
            </p>
            <p>
              What distinguishes {siteConfig.company.name} is the ability to scale innovation from concept to market. Whether enabling extended EV range through lightweight components, delivering optical-grade clarity for critical medical housings, or powering next-generation building systems, polycarbonate provides the performance and reliability premium applications demand.
            </p>
            <p>
              Sustainability anchors this strategy. We are advancing circular production systems designed to meet surging global demand while reducing environmental impact—making polycarbonate a foundation for responsible, high-performance industrial growth.
            </p>
            <p>
              As industries transition toward efficiency, sustainability, and technological advancement, polycarbonate has become structurally essential to competitive success. {siteConfig.company.name} stands as the trusted partner for organizations committed to innovation-driven value creation and long-term advantage in markets that matter.
            </p>
          </div>
        </div>
      </div>

      {/* Applications showcase gallery */}
      <div className="bg-background py-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">See It In Action</p>
            <h2 className="text-3xl font-bold text-foreground mb-3 font-display">Real-World Polycarbonate Excellence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From cutting-edge automotive components to architectural glazing, medical housings to precision electronics — polycarbonate delivers across industries.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Automotive */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/2021_bmw_7-series_sedan_750i-xdrive_edetail_oem_1_815.avif"
                alt="BMW luxury automotive with polycarbonate components"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Automotive Lightweighting</p>
              </div>
            </div>

            {/* Architecture */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/luxury-balcony-polycarbonate-roof.jpg"
                alt="Premium architectural polycarbonate roofing"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Architectural Glazing</p>
              </div>
            </div>

            {/* Medical */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/medical-polycarbonate-device.jpg"
                alt="Medical device housing with polycarbonate"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Medical Devices</p>
              </div>
            </div>

            {/* Electronics */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/Materials-for-Consumer-Electronics-Manufacturing-Hero-2048x1366-1-1200x900.jpg"
                alt="Consumer electronics with polycarbonate enclosures"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Electronics & Devices</p>
              </div>
            </div>

            {/* Industrial Safety */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/machine-guard-polycarbonate.webp"
                alt="Industrial machine guarding with polycarbonate"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Industrial Safety</p>
              </div>
            </div>

            {/* Optics */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/BMW-Laser-light-detail-on-G15-8-Series.jpg"
                alt="Optical clarity in BMW laser lighting systems"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Optical Clarity</p>
              </div>
            </div>

            {/* Roofing & Canopy */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/polycarbonate-windows-canopy.jpg"
                alt="Polycarbonate window canopy and roofing systems"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Roofing & Canopies</p>
              </div>
            </div>

            {/* Materials & Innovation */}
            <div className="group relative overflow-hidden rounded-lg aspect-square bg-muted">
              <Image
                src="/pictures/polycarbonate-resin-grade.webp"
                alt="Advanced polycarbonate resin grades for industrial use"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Advanced Materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industries We Serve */}
      <ApplicationsGrid />

      {/* Why Polycarbonate */}
      <WhyPolycarbonate />

      {/* Brand Partners */}
      <BrandsGrid />

      {/* Testimonials */}
      <Testimonials />

      {/* Contact CTA */}
      <div className="bg-steel-950 py-14">
        <div className="container mx-auto text-center">
          <TrendingUp className="h-12 w-12 text-brand-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-white mb-3 font-display">Ready to work with us?</h2>
          <p className="text-white/60 text-sm mb-7 max-w-md mx-auto">
            Whether you need a single sample or a long-term supply agreement, our team will respond within 1 business day.
          </p>
          <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
            <Link href="/contact?source=about-bottom-cta">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
