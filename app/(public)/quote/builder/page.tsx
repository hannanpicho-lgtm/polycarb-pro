'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  productPrices, shippingRegions, formatPrice, catalogListUnit,
  calcShipping, type Currency, type PublicCatalogProduct, type ShippingRegion,
} from '@/lib/pricing';

function catalogFallback(): PublicCatalogProduct[] {
  return productPrices.map((p) => ({ ...p, unitPriceAUD: null, featured: false }));
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  product: PublicCatalogProduct;
  qty: number;
}

// ── Category metadata ─────────────────────────────────────────────────────────

const CATEGORIES: { key: string; label: string; slugPrefix?: string[] }[] = [
  { key: 'all',       label: 'All Products' },
  { key: 'sheets',    label: 'Sheets',         slugPrefix: ['makrolon-2407', 'lexan-thermoclear', 'makrolon-2805', 'lexan-lx', 'calibre-solid-sheet', 'panlite-twinwall', 'iupilon-pc-sheet', 'lupoy-pc-sheet'] },
  { key: 'rods',      label: 'Rods & Profiles', slugPrefix: ['pc-solid-rod', 'pc-extruded-rod', 'lexan-rod', 'calibre-pc-tube', 'panlite-rod-medical', 'iupilon-rod', 'lupoy-rod', 'pc-plate'] },
  { key: 'resins',    label: 'Resins',          slugPrefix: ['sabic-lexan-940', 'makrolon-gf30', 'calibre-ep5030', 'lupoy-gp1000', 'lexan-exl', 'panlite-l1225', 'iupilon-h3000'] },
  { key: 'specialty', label: 'Specialty',       slugPrefix: ['covestro-makrolon-ar', 'sabic-lexan-fp', 'trinseo-calibre', 'lg-chem', 'teijin', 'mitsubishi', 'covestro-makrolon-esd', 'lexan-ballistic', 'calibre-automotive', 'lupoy-impact', 'makrolon-medical', 'lexan-medical', 'calibre-medical', 'panlite-medical', 'iupilon-medical', 'lupoy-medical'] },
];

function getCategory(slug: string): string {
  for (const cat of CATEGORIES.slice(1)) {
    if (cat.slugPrefix?.some(p => slug.startsWith(p))) return cat.key;
  }
  return 'resins';
}

const CAT_COLORS: Record<string, string> = {
  sheets: 'bg-blue-100 text-blue-700',
  rods: 'bg-slate-100 text-slate-700',
  resins: 'bg-purple-100 text-purple-700',
  specialty: 'bg-orange-100 text-orange-700',
};

// ── Helper ────────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

// ── Main component ─────────────────────────────────────────────────────────────

function BuilderContent() {
  const searchParams = useSearchParams();
  const preloadSlug = searchParams.get('product') ?? '';

  const [catalog, setCatalog] = useState<PublicCatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [items, setItems] = useState<LineItem[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [region, setRegion] = useState<ShippingRegion | null>(null);
  const [catFilter, setCatFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<PublicCatalogProduct | null>(null);
  const [pendingQty, setPendingQty] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/catalog/prices')
      .then((r) => r.json())
      .then((d: { products?: PublicCatalogProduct[] }) => {
        if (cancelled) return;
        setCatalog(d.products?.length ? d.products : catalogFallback());
      })
      .catch(() => {
        if (!cancelled) setCatalog(catalogFallback());
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Preload product from URL param
  useEffect(() => {
    if (preloadSlug && catalog.length) {
      const found = catalog.find(p => p.slug === preloadSlug);
      if (found) setSelectedProduct(found);
    }
  }, [preloadSlug, catalog]);

  const filteredProducts = useMemo(() => {
    let list = catalog;
    if (catFilter !== 'all') list = list.filter(p => getCategory(p.slug) === catFilter);
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [catFilter, productSearch, catalog]);

  function addItem() {
    if (!selectedProduct) return;
    const qty = parseFloat(pendingQty);
    if (!qty || qty <= 0) return;
    setItems(prev => [...prev, { id: uid(), product: selectedProduct, qty }]);
    setSelectedProduct(null);
    setPendingQty('');
    setProductSearch('');
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  const totalKg = items.reduce((s, i) => s + i.qty, 0);

  const subtotal = useMemo(() => {
    return items.reduce((s, i) => {
      return s + catalogListUnit(i.product, currency) * i.qty;
    }, 0);
  }, [items, currency]);

  const shipping = region ? calcShipping(region.id, totalKg, currency) : 0;
  const total = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { setSubmitError('Add at least one product to continue.'); return; }
    if (!name.trim() || !email.trim()) { setSubmitError('Name and email are required.'); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerCompany: company.trim() || undefined,
          customerPhone: phone.trim() || undefined,
          currency,
          shippingRegion: region?.label,
          items: items.map(i => ({
            productSlug: i.product.slug,
            productName: i.product.name,
            qty: i.qty,
            unit: i.product.unit,
            unitPriceUSD: i.product.unitPriceUSD,
            lineTotal: catalogListUnit(i.product, currency) * i.qty,
          })),
          message: message.trim() || undefined,
          source: 'web-builder',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setSubmitted(data.referenceId);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Quote submitted!</h2>
          <p className="text-sm text-slate-500 mb-2">Your reference number is:</p>
          <p className="font-mono text-lg font-black text-brand-600 mb-5">{submitted}</p>
          <p className="text-sm text-slate-500 mb-6">Our team will review your quote and respond within <strong>1 business day</strong>. Keep an eye on your inbox.</p>
          <div className="flex flex-col gap-2">
            <Link href="/products" className="block w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
              Continue browsing products
            </Link>
            <Link href="/portal" className="block w-full py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Track my order in portal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0a1628] pt-28 pb-10">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">Instant Quote Builder</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2">Build Your Quote</h1>
          <p className="text-white/60 text-sm max-w-xl">
            Select products, set quantities, choose your shipping region — see live pricing instantly. Submit and our team responds within 1 business day.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container mx-auto py-10">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Product builder ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Product selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">
                1 — Select Products
              </h2>

              {/* Category filter */}
              <div className="flex gap-2 flex-wrap mb-3">
                {CATEGORIES.map(c => (
                  <button key={c.key} type="button" onClick={() => { setCatFilter(c.key); setSelectedProduct(null); setProductSearch(''); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${catFilter === c.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Product search */}
              <input
                type="text"
                placeholder="Search products…"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                className="w-full mb-3 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              />

              {/* Product list */}
              <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-100">
                {catalogLoading ? (
                  <div className="py-10 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Loading catalog…
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No products match</p>
                ) : filteredProducts.map(p => {
                  const cat = getCategory(p.slug);
                  const isSelected = selectedProduct?.slug === p.slug;
                  return (
                    <button key={p.slug} type="button" onClick={() => { setSelectedProduct(p); setPendingQty(String(p.minQty)); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-slate-50'}`}>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${CAT_COLORS[cat] ?? ''}`}>{cat}</span>
                      <span className="flex-1 text-sm font-medium text-slate-800 truncate">{p.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0 font-mono">{formatPrice(catalogListUnit(p, currency), currency)}/{p.unit}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add item row */}
              {selectedProduct && (
                <div className="mt-4 flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedProduct.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Min order: {selectedProduct.minQty} {selectedProduct.unit} · Lead time: {selectedProduct.leadTimeDays}d</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input type="number" min={selectedProduct.minQty} step={1} value={pendingQty}
                      onChange={e => setPendingQty(e.target.value)}
                      className="w-24 px-2 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40 bg-white"
                      placeholder={`${selectedProduct.minQty} kg`}
                    />
                    <span className="text-xs text-slate-500">{selectedProduct.unit}</span>
                    <button type="button" onClick={addItem}
                      className="px-4 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap">
                      Add to quote
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Line items table */}
            {items.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Your items</h2>
                  <span className="text-xs text-slate-400">{items.length} product{items.length !== 1 ? 's' : ''} · {totalKg} kg total</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map(item => {
                    const unitPrice = catalogListUnit(item.product, currency);
                    const line = unitPrice * item.qty;
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-slate-400">{formatPrice(unitPrice, currency)}/{item.product.unit}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input type="number" min={1} step={1} value={item.qty}
                            onChange={e => updateQty(item.id, parseFloat(e.target.value) || 1)}
                            className="w-20 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                          />
                          <span className="text-xs text-slate-400">{item.product.unit}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 w-24 text-right flex-shrink-0">
                          {formatPrice(line, currency)}
                        </p>
                        <button type="button" onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 ml-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping + currency */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">2 — Shipping & Currency</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Shipping region</label>
                  <select value={region?.id ?? ''} onChange={e => setRegion(shippingRegions.find(r => r.id === e.target.value) ?? null)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40 bg-white">
                    <option value="">Not sure yet</option>
                    {shippingRegions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Currency</label>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                    {(['USD', 'AUD'] as Currency[]).map(c => (
                      <button key={c} type="button" onClick={() => setCurrency(c)}
                        className={`flex-1 py-2 text-sm font-semibold transition-colors ${currency === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">3 — Your Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email *</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Company</label>
                  <input value={company} onChange={e => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Additional notes (optional)</label>
                <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Delivery deadlines, certification requirements, custom specs…"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40 resize-none" />
              </div>
            </div>
          </div>

          {/* ── Right: Summary + submit ── */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24">

            {/* Price summary */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Order summary</h3>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">No products added yet</p>
                ) : (
                  <>
                    {items.map(item => {
                      const line = catalogListUnit(item.product, currency) * item.qty;
                      return (
                        <div key={item.id} className="flex justify-between text-xs gap-2">
                          <span className="text-slate-600 truncate flex-1">{item.product.name}</span>
                          <span className="text-slate-800 font-medium flex-shrink-0">{formatPrice(line, currency)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-800">{formatPrice(subtotal, currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Shipping est.</span>
                        <span className="font-semibold text-slate-800">{region ? formatPrice(shipping, currency) : '—'}</span>
                      </div>
                      <div className="flex justify-between text-base border-t border-slate-100 pt-2 mt-2">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-black text-brand-600">{formatPrice(total, currency)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Indicative pricing · {currency} · Subject to confirmation
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Lead time breakdown */}
            {items.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Lead times</h3>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-600 truncate flex-1">{item.product.name}</span>
                    <span className="text-slate-500 flex-shrink-0">{item.product.leadTimeDays}d</span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</p>
            )}

            <button type="submit" disabled={submitting || items.length === 0}
              className="w-full py-3.5 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-600/20">
              {submitting ? 'Submitting…' : 'Submit Quote Request'}
            </button>

            <p className="text-center text-xs text-slate-400">
              Our team responds within 1 business day
            </p>

            <div className="border-t border-slate-200 pt-4 space-y-2.5">
              <Link href="/portal" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Track existing orders in portal
              </Link>
              <Link href="/distributor" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
                Distributor partner? Access your portal
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function QuoteBuilderPage() {
  return (
    <Suspense>
      <BuilderContent />
    </Suspense>
  );
}
