'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AUD_RATE } from '@/lib/pricing';

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminProduct {
  slug: string;
  name: string;
  unitPriceUSD: number;
  unitPriceAUD: number | null;
  unit: string;
  minQty: number;
  leadTimeDays: number;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  adminNotes: string | null;
  updatedAt: string | null;
  inDB: boolean;
}

type EditState = Partial<{
  unitPriceUSD: string;
  unitPriceAUD: string;
  minQty: string;
  leadTimeDays: string;
  adminNotes: string;
}>;

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  'solid-sheet': 'Sheets',
  twinwall: 'Sheets',
  multiwall: 'Sheets',
  'solar-control': 'Sheets',
  rod: 'Rods & Profiles',
  tube: 'Rods & Profiles',
  plate: 'Rods & Profiles',
  resin: 'Resins',
  compound: 'Resins',
};
function guessCategory(slug: string): string {
  for (const [k, v] of Object.entries(CATEGORY_MAP)) {
    if (slug.includes(k)) return v;
  }
  if (slug.includes('medical')) return 'Medical';
  if (
    slug.includes('resin') ||
    slug.includes('lexan-940') ||
    slug.includes('gp1000') ||
    slug.includes('gf30') ||
    slug.includes('ep5030') ||
    slug.includes('exl') ||
    slug.includes('l1225') ||
    slug.includes('h3000')
  )
    return 'Resins';
  if (slug.includes('rod') || slug.includes('tube') || slug.includes('plate'))
    return 'Rods & Profiles';
  if (
    slug.includes('sheet') ||
    slug.includes('thermoclear') ||
    slug.includes('panlite-tw') ||
    slug.includes('iupilon-pc-sheet') ||
    slug.includes('lupoy-pc-sheet') ||
    slug.includes('calibre-solid') ||
    slug.includes('makrolon-2')
  )
    return 'Sheets';
  return 'Specialty';
}

const CATEGORY_ORDER = ['Sheets', 'Rods & Profiles', 'Resins', 'Medical', 'Specialty'];

const CATEGORY_COLORS: Record<string, string> = {
  Sheets: 'bg-blue-50 text-blue-700 border-blue-200',
  'Rods & Profiles': 'bg-violet-50 text-violet-700 border-violet-200',
  Resins: 'bg-amber-50 text-amber-700 border-amber-200',
  Medical: 'bg-rose-50 text-rose-700 border-rose-200',
  Specialty: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function fmtUSD(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}
function fmtAUD(n: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(n);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const editRef = useRef<HTMLTableRowElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as { products: AdminProduct[] };
      setProducts(data.products ?? []);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-seed on first visit when DB has no records
  useEffect(() => {
    if (!loading && products.length > 0 && products.every((p) => !p.inDB)) {
      handleSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleSeed() {
    setSeeding(true);
    try {
      await fetch('/api/admin/products', { method: 'POST' });
      await load();
    } catch {
      /* silent */
    }
    setSeeding(false);
  }

  async function handleToggle(slug: string, field: 'isActive' | 'featured', current: boolean) {
    setSaving(true);
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, [field]: !current }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, [field]: !current, inDB: true } : p))
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product: AdminProduct) {
    setEditingSlug(product.slug);
    setEditState({
      unitPriceUSD: product.unitPriceUSD.toFixed(2),
      unitPriceAUD: product.unitPriceAUD != null ? product.unitPriceAUD.toFixed(2) : '',
      minQty: product.minQty.toString(),
      leadTimeDays: product.leadTimeDays.toString(),
      adminNotes: product.adminNotes ?? '',
    });
    setSaveMsg('');
    setTimeout(() => editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  async function handleSave(slug: string) {
    setSaving(true);
    setSaveMsg('');
    try {
      const payload: Record<string, unknown> = { slug };
      if (editState.unitPriceUSD) payload.unitPriceUSD = parseFloat(editState.unitPriceUSD);
      payload.unitPriceAUD = editState.unitPriceAUD ? parseFloat(editState.unitPriceAUD) : null;
      if (editState.minQty) payload.minQty = parseFloat(editState.minQty);
      if (editState.leadTimeDays) payload.leadTimeDays = parseInt(editState.leadTimeDays);
      payload.adminNotes = editState.adminNotes || null;

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save failed');
      setSaveMsg('Saved');
      setEditingSlug(null);
      await load();
    } catch {
      setSaveMsg('Error saving');
    } finally {
      setSaving(false);
    }
  }

  // ── Derived lists ────────────────────────────────────────────────────────────
  const categories = ['All', ...CATEGORY_ORDER];
  const filtered = products.filter((p) => {
    const cat = guessCategory(p.slug);
    const matchCat = filterCategory === 'All' || cat === filterCategory;
    const matchStatus =
      filterStatus === 'all' ? true : filterStatus === 'active' ? p.isActive : !p.isActive;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const grouped = CATEGORY_ORDER.reduce<Record<string, AdminProduct[]>>((acc, cat) => {
    const items = filtered.filter((p) => guessCategory(p.slug) === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const activeCount = products.filter((p) => p.isActive).length;
  const featuredCount = products.filter((p) => p.featured).length;
  const dbCount = products.filter((p) => p.inDB).length;

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Product & Pricing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage prices, availability and lead times without a code deploy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dbCount < products.length && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {seeding ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              )}
              Seed from static data
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Products', value: products.length, color: 'text-slate-800' },
          { label: 'Active', value: activeCount, color: 'text-emerald-600' },
          { label: 'Featured', value: featuredCount, color: 'text-blue-600' },
          { label: 'Managed in DB', value: dbCount, color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white w-56"
        />
        <div className="flex gap-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === c
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterStatus === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Loading products…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[category] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    {category}
                  </span>
                  <span className="text-xs text-slate-400">{items.length} products</span>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 w-[300px]">
                      Product
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">
                      USD / kg
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">
                      AUD / kg
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">
                      Min Qty
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">
                      Lead time
                    </th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">
                      Active
                    </th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">
                      Featured
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => {
                    const isEditing = editingSlug === product.slug;
                    const audEffective =
                      product.unitPriceAUD != null
                        ? product.unitPriceAUD
                        : product.unitPriceUSD * AUD_RATE;

                    return (
                      <>
                        <tr
                          key={product.slug}
                          className={`border-b border-slate-50 last:border-0 transition-colors ${isEditing ? 'bg-brand-50/50' : 'hover:bg-slate-50/60'}`}
                        >
                          {/* Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <div>
                                <p className="font-medium text-slate-800 leading-tight">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {product.slug}
                                </p>
                                {product.adminNotes && (
                                  <p className="text-[11px] text-amber-600 mt-0.5 italic">
                                    {product.adminNotes}
                                  </p>
                                )}
                              </div>
                              {!product.inDB && (
                                <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 font-mono mt-0.5">
                                  static
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Prices */}
                          <td className="px-3 py-3 text-right font-mono text-sm text-slate-700">
                            {fmtUSD(product.unitPriceUSD)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-sm text-slate-500">
                            {fmtAUD(audEffective)}
                            {product.unitPriceAUD == null && (
                              <span className="ml-1 text-[10px] text-slate-300">auto</span>
                            )}
                          </td>

                          {/* Min Qty */}
                          <td className="px-3 py-3 text-right text-slate-600">
                            {product.minQty} {product.unit}
                          </td>

                          {/* Lead time */}
                          <td className="px-3 py-3 text-right text-slate-600">
                            {product.leadTimeDays}d
                          </td>

                          {/* Active toggle */}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() =>
                                handleToggle(product.slug, 'isActive', product.isActive)
                              }
                              disabled={saving}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                product.isActive ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                              title={
                                product.isActive
                                  ? 'Active — click to deactivate'
                                  : 'Inactive — click to activate'
                              }
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${
                                  product.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Featured toggle */}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() =>
                                handleToggle(product.slug, 'featured', product.featured)
                              }
                              disabled={saving}
                              title={product.featured ? 'Featured' : 'Not featured'}
                              className="transition-colors"
                            >
                              <svg
                                className={`w-4 h-4 ${product.featured ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                />
                              </svg>
                            </button>
                          </td>

                          {/* Edit button */}
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() =>
                                isEditing ? setEditingSlug(null) : startEdit(product)
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                isEditing
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                              }`}
                            >
                              {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                          </td>
                        </tr>

                        {/* Inline edit row */}
                        {isEditing && (
                          <tr ref={editRef} className="border-b border-brand-100 bg-brand-50/30">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="flex items-end gap-4 flex-wrap">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    USD Price / kg
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                      $
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editState.unitPriceUSD}
                                      onChange={(e) =>
                                        setEditState((s) => ({
                                          ...s,
                                          unitPriceUSD: e.target.value,
                                        }))
                                      }
                                      className="pl-7 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 w-28 font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    AUD Price / kg{' '}
                                    <span className="text-slate-400 font-normal">
                                      (leave blank = auto)
                                    </span>
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                      A$
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder={`${(parseFloat(editState.unitPriceUSD ?? '0') * AUD_RATE).toFixed(2)}`}
                                      value={editState.unitPriceAUD}
                                      onChange={(e) =>
                                        setEditState((s) => ({
                                          ...s,
                                          unitPriceAUD: e.target.value,
                                        }))
                                      }
                                      className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 w-28 font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Min Qty (kg)
                                  </label>
                                  <input
                                    type="number"
                                    step="1"
                                    value={editState.minQty}
                                    onChange={(e) =>
                                      setEditState((s) => ({ ...s, minQty: e.target.value }))
                                    }
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 w-24 font-mono"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Lead Time (days)
                                  </label>
                                  <input
                                    type="number"
                                    step="1"
                                    value={editState.leadTimeDays}
                                    onChange={(e) =>
                                      setEditState((s) => ({ ...s, leadTimeDays: e.target.value }))
                                    }
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 w-24 font-mono"
                                  />
                                </div>

                                <div className="flex-1 min-w-[180px]">
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Admin Notes
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Internal note visible in admin only…"
                                    value={editState.adminNotes}
                                    onChange={(e) =>
                                      setEditState((s) => ({ ...s, adminNotes: e.target.value }))
                                    }
                                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSave(product.slug)}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                                  >
                                    {saving ? (
                                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4.5 12.75l6 6 9-13.5"
                                        />
                                      </svg>
                                    )}
                                    Save
                                  </button>
                                  {saveMsg && (
                                    <span
                                      className={`text-xs font-medium ${saveMsg === 'Saved' ? 'text-emerald-600' : 'text-red-500'}`}
                                    >
                                      {saveMsg}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <p className="text-slate-400 text-sm">No products match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
