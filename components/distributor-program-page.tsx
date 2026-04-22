'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Package, Headphones, ArrowRight, Sparkles } from 'lucide-react';
import { DistributorPromoBanner } from '@/components/distributor-promo-banner';
import { DistributorSignupFormComponent } from '@/components/distributor-signup-form';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Tiered volume pricing',
    body: 'Bronze, silver, and gold tiers with transparent discounts off list — the more you move, the better your net price.',
  },
  {
    icon: Package,
    title: 'Full catalog access',
    body: 'Sheets, rods, resins, and specialty grades with live pricing in the distributor portal and API-aligned quotes.',
  },
  {
    icon: Headphones,
    title: 'Partner support',
    body: 'Applications engineering, co-marketing, and a dedicated line for high-volume and strategic accounts.',
  },
];

export function DistributorProgramPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1628] text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32">
          <div className="max-w-3xl">
            <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Partner program
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              Become a Covestro PC distributor
            </h1>
            <p className="mt-4 text-lg text-white/70 leading-relaxed max-w-2xl">
              Join our network of industrial partners. Stock-list pricing, tiered rebates, and priority allocation on
              engineering-grade Makrolon, Lexan, and specialty PC materials — with USD &amp; AUD support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/30 hover:bg-brand-400 transition-colors"
              >
                Apply in 2 minutes
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/distributor"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Already approved? Distributor sign-in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 pb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">{b.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="apply" className="container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 md:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Application received</h2>
              <p className="mt-2 text-slate-600 max-w-md mx-auto">
                Our partnerships team will review your profile and respond within one business day. Watch your inbox
                for next steps and portal access.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/products" className="text-sm font-bold text-brand-600 hover:underline">
                  Browse products
                </Link>
                <span className="text-slate-300">·</span>
                <Link href="/quote/builder" className="text-sm font-bold text-brand-600 hover:underline">
                  Build a quote
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <DistributorPromoBanner />
              <div className="px-5 py-8 sm:px-8 sm:py-10">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Apply now</h2>
                <p className="text-slate-600 mb-8 text-sm sm:text-base">
                  One short form — no credit card. We review every application to protect partner margins and ensure a
                  good fit.
                </p>
                {formError ? (
                  <div
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900"
                    role="alert"
                  >
                    {formError}
                  </div>
                ) : null}
                <DistributorSignupFormComponent
                  onSuccess={() => {
                    setFormError('');
                    setSubmitted(true);
                  }}
                  onError={(msg) => setFormError(msg)}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
