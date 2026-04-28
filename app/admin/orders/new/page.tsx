'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  productPrices,
  shippingRegions,
  convertPrice,
  formatPrice,
  calcShipping,
} from '@/lib/pricing';
import type { Currency } from '@/lib/pricing';

interface LineItem {
  productSlug: string;
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  currency: Currency;
}

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currency, setCurrency] = useState<Currency>(
    (searchParams.get('currency') as Currency) || 'USD'
  );
  const [customerName, setCustomerName] = useState(searchParams.get('customerName') || '');
  const [customerEmail, setCustomerEmail] = useState(searchParams.get('customerEmail') || '');
  const [customerCompany, setCustomerCompany] = useState('');
  const [shippingRegion, setShippingRegion] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [quoteId] = useState(searchParams.get('quoteId') || '');
  const [items, setItems] = useState<LineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const shippingCost = shippingRegion ? calcShipping(shippingRegion, totalQty, currency) : 0;
  const subtotal = items.reduce((s, i) => s + i.qty * convertPrice(i.unitPrice, currency), 0);
  const total = subtotal + shippingCost;

  function addItem() {
    const first = productPrices[0];
    if (!first) return;
    setItems((prev) => [
      ...prev,
      {
        productSlug: first.slug,
        productName: first.name,
        qty: first.minQty,
        unit: first.unit,
        unitPrice: first.unitPriceUSD,
        currency,
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...patch };
        if (patch.productSlug) {
          const price = productPrices.find((p) => p.slug === patch.productSlug);
          if (price) {
            updated.productName = price.name;
            updated.unitPrice = price.unitPriceUSD;
            updated.unit = price.unit;
            updated.qty = price.minQty;
          }
        }
        return updated;
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !customerEmail || items.length === 0) {
      setError('Customer name, email and at least one product are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerCompany,
          quoteId: quoteId || undefined,
          currency,
          items: items.map((i) => ({
            ...i,
            unitPrice: convertPrice(i.unitPrice, currency),
          })),
          shippingRegion: shippingRegion || undefined,
          shippingCost,
          shippingAddress: shippingAddress || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      const data = await res.json();
      router.replace(`/admin/orders?highlight=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
        {quoteId && <p className="text-sm text-brand-600 mt-0.5">Converting from quote</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name *" required value={customerName} onChange={setCustomerName} />
            <Field
              label="Email *"
              type="email"
              required
              value={customerEmail}
              onChange={setCustomerEmail}
            />
            <Field label="Company" value={customerCompany} onChange={setCustomerCompany} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
              </select>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Products</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              + Add line
            </button>
          </div>
          {items.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No products added yet — click "Add line"
            </p>
          )}
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-end border-b border-slate-100 pb-4"
            >
              <div className="col-span-5">
                <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                <select
                  value={item.productSlug}
                  onChange={(e) => updateItem(i, { productSlug: e.target.value })}
                  className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                >
                  {productPrices.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Qty (kg)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={item.qty}
                  onChange={(e) => updateItem(i, { qty: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Unit price ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={convertPrice(item.unitPrice, currency).toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    updateItem(i, { unitPrice: currency === 'AUD' ? val / 1.55 : val });
                  }}
                  className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
              <div className="col-span-1">
                <p className="text-[10px] text-slate-400 mb-1">Line total</p>
                <p className="text-xs font-semibold text-slate-700">
                  {formatPrice(item.qty * convertPrice(item.unitPrice, currency), currency)}
                </p>
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-slate-300 hover:text-red-500 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Shipping */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Shipping</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Region</label>
              <select
                value={shippingRegion}
                onChange={(e) => setShippingRegion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <option value="">Select region…</option>
                {shippingRegions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Shipping cost</p>
              <p className="text-sm font-semibold text-slate-900 py-2">
                {formatPrice(shippingCost, currency)}
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Delivery address
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              />
            </div>
          </div>
        </section>

        {/* Totals + notes */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Shipping</span>
            <span className="font-medium">{formatPrice(shippingCost, currency)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-3">
            <span>Total</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Admin notes</label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40"
      />
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense>
      <NewOrderContent />
    </Suspense>
  );
}
