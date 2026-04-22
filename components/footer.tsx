import Link from 'next/link';
import { Linkedin, Youtube, Instagram, Facebook, Mail, Phone, MapPin, ArrowRight, MessageCircle, Send, Music2 } from 'lucide-react';
import { NewsletterForm } from '@/components/newsletter-form';
import { BuildStamp } from '@/components/build-stamp';
import { siteConfig } from '@/lib/site-config';

const footerLinks = {
  products: [
    { label: 'Polycarbonate Sheets', href: '/products?category=sheets' },
    { label: 'Rods & Profiles', href: '/products?category=rods' },
    { label: 'PC Resins', href: '/products?category=resins' },
    { label: 'Specialty Grades', href: '/products?category=specialty' },
    { label: 'Browse All Products', href: '/products' },
  ],
  applications: [
    { label: 'Automotive', href: '/applications/automotive' },
    { label: 'Construction', href: '/applications/construction' },
    { label: 'Medical Devices', href: '/applications/medical' },
    { label: 'Electronics', href: '/applications/electronics' },
    { label: 'Safety & Protection', href: '/applications/safety' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Brands', href: '/brands' },
    { label: 'Resources & Blog', href: '/resources' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Technical Support', href: '/contact' },
    { label: 'Request a Quote', href: '/quote?source=footer-company-links' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
  { icon: Youtube, href: siteConfig.social.youtube, label: 'YouTube' },
  { icon: Instagram, href: siteConfig.social.instagram, label: 'Instagram' },
  { icon: Facebook, href: siteConfig.social.facebook, label: 'Facebook' },
  { icon: MessageCircle, href: siteConfig.social.whatsapp, label: 'WhatsApp' },
  { icon: Send, href: siteConfig.social.telegram, label: 'Telegram' },
  { icon: Music2, href: siteConfig.social.tiktok, label: 'TikTok' },
].filter((s) => s.href);

export function Footer() {
  return (
    <footer className="bg-steel-950 text-white" aria-label="Site footer">
      {/* Upper CTA strip */}
      <div className="bg-brand-500">
        <div className="container mx-auto py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Ready to specify your next project?</h2>
            <p className="text-white/80 mt-1 text-sm">
              Get technical support, datasheets, and pricing in one request.
            </p>
          </div>
          <Link
            href="/quote?source=footer-cta-strip"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-7 py-3.5 rounded hover:bg-steel-50 transition-colors text-sm whitespace-nowrap flex-shrink-0"
          >
            Contact Sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="text-xl font-bold tracking-tight">{siteConfig.company.name}</div>
              <p className="text-white/50 text-xs uppercase tracking-widest mt-0.5">{siteConfig.company.tagline}</p>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              World-class distributor of engineering-grade polycarbonate materials — from transparent glazing
              sheets to optical resins and structural compounds. Serving industrial OEMs globally since 2003.
            </p>

            {/* Contact CTA */}
            <div className="space-y-2 text-sm text-white/60">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors font-semibold text-base"
              >
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-400 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <FooterLinkGroup title="Our Products" links={footerLinks.products} />
          <FooterLinkGroup title="Applications" links={footerLinks.applications} />
          <FooterLinkGroup title="Company" links={footerLinks.company} />
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-white/10">
          <div className="max-w-lg">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 mb-1">Industry Newsletter</h3>
            <p className="text-sm text-white/50 mb-4">
              Material updates, new grades, regulatory news, and technical resources — monthly.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span>Copyright © {new Date().getFullYear()} {siteConfig.company.legalName}. All rights reserved.</span>
            <span className="inline-flex items-center rounded border border-brand-400/40 bg-brand-500/10 px-2 py-0.5 text-[11px] font-semibold text-brand-200">
              Cursor verification marker
            </span>
            <BuildStamp />
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Statement</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
