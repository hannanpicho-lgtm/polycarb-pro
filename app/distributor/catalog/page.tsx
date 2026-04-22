'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productPrices, convertPrice, formatPrice, type Currency } from '@/lib/pricing';
import { applyTierDiscount, TIER_CONFIG, type DiscountTier } from '@/lib/distributor-auth';

type Category = 'all' | 'sheets' | 'rods' | 'resins' | 'specialty';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All Products', sheets: 'Sheets', rods: 'Rods & Profiles', resins: 'Resins', specialty: 'Specialty',
};

const SLUG_TO_CATEGORY: Record<string, Category> = {};
const SHEETS = ['sheet', 'twinwall', 'multiwall', 'architectural', 'solar'];
const RODS = ['rod', 'tube', 'plate'];
const RESINS = ['resin', 'gf30', 'fr-resin', 'gp1000', 'h3000', 'siloxane', 'l1225'];
productPrices.forEach(p => {
  if (SHEETS.some(k => p.slug.includes(k))) SLUG_TO_CATEGORY[p.slug] = 'sheets';
  else if (RODS.some(k => p.slug.includes(k))) SLUG_TO_CATEGORY[p.slug] = 'rods';
  else if (RESINS.some(k => p.slug.includes(k))) SLUG_TO_CATEGORY[p.slug] = 'resins';
  else SLUG_TO_CATEGORY[p.slug] = 'specialty';
});

export default function DistributorCatalogPage() {
  const router = useRouter();
  const [tier, setTier] = useState<DiscountTier>('bronze');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/distributor/me').then(async res => {
      if (res.status === 401) { router.replace('/distributor'); return; }
      if (res.ok) {
        const data = await res.json();
        if (data.profile?.status !== 'approved') { router.replace('/distributor/dashboard'); return; }
        setTier((data.profile.discountTier || 'bronze') as DiscountTier);
      }
    }).finally(() => setLoading(false));
  }, [router]);

  const tierInfo = TIER_CONFIG[tier];

  const filtered = productPrices.filter(p => {
    const catMatch = category === 'all' || SLUG_TO_CATEGORY[p.slug] === category;
    const searchMatch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/distributor/dashboard" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tierInfo.color}`}>
            {tierInfo.badge} {tierInfo.label} — {Math.round(tierInfo.discount * 100)}% off
          </span>
          <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none">
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Your net prices with {Math.round(tierInfo.discount * 100)}% {tierInfo.label} discount applied · {filtered.length} products
            </p>
          </div>
          <Link href="/distributor/quotes/new"
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors flex-shrink-0">
            + New Quote
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === c ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="ml-auto px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-52" />
        </div>

        {/* Price guide header */}
        <div className="grid grid-cols-4 gap-2 px-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-200 pb-2">
          <span className="col-span-2">Product</span>
          <span className="text-right">List price / kg</span>
          <span className="text-right">Your net price / kg</span>
        </div>

        {/* Product rows */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {filtered.map(p => {
            const listUSD = p.unitPriceUSD;
            const netUSD = applyTierDiscount(listUSD, tier);
            const listDisplay = formatPrice(convertPrice(listUSD, currency), currency);
            const netDisplay = formatPrice(convertPrice(netUSD, currency), currency);
            const saving = Math.round(tierInfo.discount * 100);
            const cat = SLUG_TO_CATEGORY[p.slug] ?? 'specialty';
            const catColor: Record<Category, string> = {
              all: 'bg-slate-100 text-slate-500',
              sheets: 'bg-sky-50 text-sky-600',
              rods: 'bg-amber-50 text-amber-700',
              resins: 'bg-emerald-50 text-emerald-700',
              specialty: 'bg-violet-50 text-violet-700',
            };
            return (
              <div key={p.slug} className="grid grid-cols-4 gap-2 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="col-span-2 flex items-start gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${catColor[cat]}`}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-[10px] text-slate-400">Min {p.minQty}kg · {p.leadTimeDays}d lead</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 line-through">{listDisplay}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{netDisplay}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Save {saving}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-800">
          <p className="font-medium mb-0.5">Prices are indicative only</p>
          <p className="text-brand-600 text-xs leading-relaxed">
            Submit a quote for a binding offer. Prices shown are ex-works in {currency} and exclude shipping.
            Tier pricing is subject to your annual volume commitment. Contact your account manager for volume discounts beyond {Math.round(tierInfo.discount * 100)}%.
          </p>
        </div>
      </div>
    </div>
  );
}
