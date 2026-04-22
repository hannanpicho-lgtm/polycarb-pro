'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { siteConfig } from '@/lib/site-config';
import { cn } from '@/lib/utils';

const navLinks = [
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'Polycarbonate Sheets', href: '/products?category=sheets' },
      { label: 'Rods & Profiles', href: '/products?category=rods' },
      { label: 'PC Resins & Compounds', href: '/products?category=resins' },
      { label: 'Specialty Grades', href: '/products?category=specialty' },
    ],
  },
  {
    label: 'Applications',
    href: '/applications',
    children: [
      { label: 'Automotive', href: '/applications/automotive' },
      { label: 'Construction', href: '/applications/construction' },
      { label: 'Medical Devices', href: '/applications/medical' },
      { label: 'Electronics', href: '/applications/electronics' },
      { label: 'Optics & Lighting', href: '/applications/optical' },
      { label: 'Safety & Protection', href: '/applications/safety' },
    ],
  },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Technical Library', href: '/resources' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-steel-950/95 dark:bg-steel-950/98 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-steel-950'
      )}
    >
      {/* Top utility bar */}
      <div className="border-b border-white/10 hidden lg:block">
        <div className="container mx-auto flex items-center justify-end gap-6 py-1.5 text-xs text-white/60">
          <a href={`tel:${siteConfig.contact.phoneHref}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="h-3 w-3" />
            {siteConfig.contact.phoneDisplay}
          </a>
          <span>{siteConfig.contact.businessHours}</span>
          <Link href="/track" className="hover:text-white transition-colors">
            Track Order
          </Link>
          <Link href="/quote?source=navbar-utility" className="hover:text-white transition-colors">
            Request Quote
          </Link>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="container mx-auto" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label={`${siteConfig.company.name} – Home`}>
            <PolyLogo />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none tracking-tight group-hover:text-brand-400 transition-colors font-display">
                {siteConfig.company.shortName}
              </span>
              <span className="text-white/50 text-[10px] uppercase tracking-widest leading-none mt-0.5 hidden sm:block">
                {siteConfig.company.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded transition-colors',
                      pathname.startsWith(link.href)
                        ? 'text-brand-400'
                        : 'text-white/80 hover:text-white'
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        openDropdown === link.label ? 'rotate-180' : ''
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-steel-900 border border-border rounded shadow-xl overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-steel-700 dark:text-steel-200 hover:bg-muted hover:text-primary transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded transition-colors',
                    pathname === link.href
                      ? 'text-brand-400'
                      : 'text-white/80 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              className="hidden lg:inline-flex bg-brand-500 hover:bg-brand-600 text-white border-0"
            >
              <Link href="/quote?source=navbar-desktop">Request Quote</Link>
            </Button>
            <button
              className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-steel-950 border-t border-white/10"
          >
            <nav className="container mx-auto py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'px-4 py-3 text-sm font-medium rounded transition-colors',
                      pathname.startsWith(link.href) ? 'text-brand-400 bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="pl-8 pr-4 py-2 text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </React.Fragment>
              ))}
              <div className="pt-3 border-t border-white/10 mt-2">
                <Button asChild className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                  <Link href="/quote?source=navbar-mobile">Request Quote</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function PolyLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logoMetalRing" x1="4" y1="4" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E6EEF8" />
          <stop offset="0.48" stopColor="#8EA5BF" />
          <stop offset="1" stopColor="#F5F9FF" />
        </linearGradient>
        <radialGradient id="logoCore" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(19 17) rotate(90) scale(20)">
          <stop offset="0" stopColor="#133A5A" stopOpacity="0.95" />
          <stop offset="1" stopColor="#051221" stopOpacity="0.98" />
        </radialGradient>
      </defs>

      <circle cx="19" cy="19" r="17" fill="url(#logoCore)" />
      <circle cx="19" cy="19" r="17" stroke="url(#logoMetalRing)" strokeWidth="1.6" />
      <circle cx="15" cy="11" r="8" fill="#FFFFFF" fillOpacity="0.09" />

      {/* Refined translucent spectral arc */}
      {[
        ['#8B7BFF', 7.8, 15.3, 1.65, 0.66],
        ['#5D9EFF', 10.5, 10.2, 1.85, 0.7],
        ['#53C8FF', 14.3, 7.3, 1.7, 0.7],
        ['#37D0B0', 19.2, 6.4, 1.7, 0.66],
        ['#85D86A', 24.1, 8.2, 1.6, 0.62],
        ['#E5BA58', 27.8, 11.9, 1.7, 0.68],
        ['#EB8D56', 29.9, 17.2, 1.7, 0.7],
        ['#E66880', 29.2, 22.8, 1.6, 0.68],
        ['#C067C2', 26.2, 27.0, 1.55, 0.64],
      ].map(([color, cx, cy, r, opacity], i) => (
        <g key={i}>
          <circle cx={cx as number} cy={cy as number} r={r as number} fill={color as string} fillOpacity={opacity as number} />
          <circle cx={(cx as number) - 0.45} cy={(cy as number) - 0.45} r={(r as number) * 0.44} fill="#FFFFFF" fillOpacity="0.34" />
        </g>
      ))}

      <text x="19" y="23.5" textAnchor="middle" fill="#EEF6FF" fontSize="10.5" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="0.3">
        PC
      </text>
    </svg>
  );
}
