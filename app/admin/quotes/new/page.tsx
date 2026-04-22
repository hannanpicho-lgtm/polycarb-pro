'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productPrices } from '@/lib/pricing';

export default function NewQuotePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerCompany: '',
    currency: 'USD', message: '', source: 'web',
    products: [{ productSlug: productPrices[0]?.slug ?? '', qty: '', notes: '' }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setProduct(i: number, key: string, value: string) {
    setForm(f => {
      const products = f.products.map((p, j) => j === i ? { ...p, [key]: value } : p);
      return { ...f, products };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const products = form.products
        .filter(p => p.productSlug)
        .map(p => {
          const price = productPrices.find(pr => pr.slug === p.productSlug);
          return { productSlug: p.productSlug, productName: price?.name ?? p.productSlug, qty: p.qty || 'TBD', notes: p.notes };
        });

      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, products }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.replace('/admin/quotes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  }

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1">← Back</button>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            {[['Full name', 'customerName', 'text', true], ['Email', 'customerEmail', 'email', true], ['Company', 'customerCompany', 'text', false]].map(([label, key, type, req]) => (
              <div key={String(key)}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}{req && ' *'}</label>
                <input type={String(type)} required={!!req} value={(form as unknown as Record<string, string>)[String(key)]}
                  onChange={e => setField(String(key), e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
              <select value={form.currency} onChange={e => setField('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40">
                <option value="USD">USD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source</label>
              <select value={form.source} onChange={e => setField('source', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40">
                <option value="web">Web form</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Products</h2>
            <button type="button" onClick={() => setForm(f => ({ ...f, products: [...f.products, { productSlug: '', qty: '', notes: '' }] }))}
              className="text-xs text-brand-600 hover:text-brand-800">+ Add product</button>
          </div>
          {form.products.map((p, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                <select value={p.productSlug} onChange={e => setProduct(i, 'productSlug', e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none">
                  <option value="">Select…</option>
                  {productPrices.map(pr => <option key={pr.slug} value={pr.slug}>{pr.name}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Qty (kg)</label>
                <input type="text" placeholder="e.g. 500" value={p.qty} onChange={e => setProduct(i, 'qty', e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none" />
              </div>
              <div className="col-span-2 flex justify-end">
                {form.products.length > 1 && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, products: f.products.filter((_, j) => j !== i) }))}
                    className="text-slate-300 hover:text-red-500 text-sm">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Customer message / notes</label>
          <textarea rows={3} value={form.message} onChange={e => setField('message', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Quote'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
