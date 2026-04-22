'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  productPrices, shippingRegions, catalogListUnit, formatPrice, type Currency, type PublicCatalogProduct,
} from '@/lib/pricing';
import { applyTierDiscount, TIER_CONFIG, type DiscountTier } from '@/lib/distributor-auth';

function catalogFallback(): PublicCatalogProduct[] {
  return productPrices.map((p) => ({ ...p, unitPriceAUD: null, featured: false }));
}

interface LineItem { productSlug: string; qty: number }

export default function NewDistributorQuote() {
  const router = useRouter();
  const [tier, setTier] = useState<DiscountTier>('bronze');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [catalog, setCatalog] = useState<PublicCatalogProduct[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [endCustomerName, setEndCustomerName] = useState('');
  const [endCustomerCompany, setEndCustomerCompany] = useState('');
  const [endCustomerCountry, setEndCustomerCountry] = useState('');
  const [shippingRegion, setShippingRegion] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/distributor/me'),
      fetch('/api/catalog/prices'),
    ])
      .then(async ([meRes, catRes]) => {
        if (meRes.status === 401) { router.replace('/distributor'); return; }
        if (meRes.ok) {
          const data = await meRes.json();
          if (data.profile?.status !== 'approved') { router.replace('/distributor/dashboard'); return; }
          setTier((data.profile.discountTier || 'bronze') as DiscountTier);
        }
        const d = (await catRes.json()) as { products?: PublicCatalogProduct[] };
        if (cancelled) return;
        const list = d.products?.length ? d.products : catalogFallback();
        setCatalog(list);
        setItems([{ productSlug: list[0]?.slug ?? '', qty: 0 }]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [router]);

  const tierInfo = TIER_CONFIG[tier];

  const previewTotal = items.reduce((sum, item) => {
    const price = catalog.find(p => p.slug === item.productSlug);
    if (!price || !item.qty) return sum;
    const listInCur = catalogListUnit(price, currency);
    const netInCur = applyTierDiscount(listInCur, tier);
    return sum + netInCur * item.qty;
  }, 0);

  function addItem() {
    setItems(prev => [...prev, { productSlug: catalog[0]?.slug ?? '', qty: 0 }]);
  }

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems(prev => prev.map((item, j) => j === i ? { ...item, ...patch } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter(i => i.productSlug && i.qty > 0);
    if (!validItems.length) { setError('Add at least one product with a quantity.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/distributor/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, items: validItems, endCustomerName, endCustomerCompany, endCustomerCountry, shippingRegion, message }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      router.replace(`/distributor/dashboard?submitted=${data.referenceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tierInfo.color}`}>
          {tierInfo.badge} {tierInfo.label} — {Math.round(tierInfo.discount * 100)}% off
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">New Quote Request</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Products */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Products</h2>
              <div className="flex items-center gap-2">
                <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none">
                  <option value="USD">USD</option>
                  <option value="AUD">AUD</option>
                </select>
                <button type="button" onClick={addItem}
                  className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  + Add
                </button>
              </div>
            </div>

            {items.map((item, i) => {
              const price = catalog.find(p => p.slug === item.productSlug);
              const listInCur = price ? catalogListUnit(price, currency) : 0;
              const netInCur = price ? applyTierDiscount(listInCur, tier) : 0;
              const netDisplay = price ? formatPrice(netInCur, currency) : '—';
              const lineTotal = price && item.qty ? netInCur * item.qty : 0;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-end border-b border-slate-100 pb-4">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                    <select value={item.productSlug} onChange={e => updateItem(i, { productSlug: e.target.value })}
                      className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none">
                      {catalog.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Qty (kg)</label>
                    <input type="number" min={0} step="1" value={item.qty || ''}
                      onChange={e => updateItem(i, { qty: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 mb-1">Net / kg</p>
                    <p className="text-xs font-semibold text-emerald-700">{netDisplay}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-[10px] text-slate-400 mb-1">Line</p>
                    <p className="text-xs font-bold text-slate-900">{lineTotal ? formatPrice(lineTotal, currency) : '—'}</p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
                        className="text-slate-300 hover:text-red-500 text-sm">✕</button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-1">
              <p className="text-xs text-slate-400">Estimated subtotal (ex-shipping)</p>
              <p className="text-base font-bold text-slate-900">{formatPrice(previewTotal, currency)}</p>
            </div>
          </section>

          {/* End customer info */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-slate-800">End Customer <span className="text-slate-400 font-normal text-xs">(optional)</span></h2>
            <div className="grid grid-cols-2 gap-4">
              {([['Name', endCustomerName, setEndCustomerName], ['Company', endCustomerCompany, setEndCustomerCompany]] as [string, string, (v: string) => void][]).map(([label, val, set]) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input type="text" value={val} onChange={e => set(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                <input type="text" value={endCustomerCountry} onChange={e => setEndCustomerCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Shipping Region</label>
                <select value={shippingRegion} onChange={e => setShippingRegion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40">
                  <option value="">— Select region —</option>
                  {shippingRegions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">Additional notes</label>
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Special requirements, urgency, delivery notes…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
          </section>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50">
              {saving ? 'Submitting…' : 'Submit Quote Request'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
