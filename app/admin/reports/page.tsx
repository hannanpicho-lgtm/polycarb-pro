'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatPrice } from '@/lib/pricing';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthRow  { month: string; orderCount: number; revenue: number; collected: number }
interface StatusRow { status: string; count: number; value?: number }
interface ProductRow{ productName: string; productSlug: string; totalQty: number; totalRevenue: number; orderCount: number }
interface DistStats { approved: number; pending: number; quotesSubmitted: number; quotesConverted: number; distRevenue: number }

interface ReportData {
  monthly: MonthRow[];
  ordersByStatus: StatusRow[];
  quotesByStatus: StatusRow[];
  quoteConversionRate: number;
  totalQuotes: number;
  convertedQuotes: number;
  topProducts: ProductRow[];
  distributors: DistStats;
  paymentBreakdown: StatusRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_LABELS: Record<string, string> = {
  '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun',
  '07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec',
};

function shortMonth(ym: string) {
  const [, m] = ym.split('-');
  return MONTH_LABELS[m ?? ''] ?? ym;
}

const STATUS_COLOR: Record<string, string> = {
  pending:'bg-amber-400', confirmed:'bg-blue-500', processing:'bg-purple-500',
  shipped:'bg-sky-500', delivered:'bg-emerald-500', cancelled:'bg-slate-300',
  paid:'bg-emerald-500', unpaid:'bg-red-400', partial:'bg-amber-400', refunded:'bg-slate-300',
  reviewed:'bg-blue-400', quoted:'bg-purple-400', accepted:'bg-emerald-400', rejected:'bg-red-400', converted:'bg-slate-400',
};

function BarChart({ data, maxVal, colorClass }: { data: { label: string; value: number }[]; maxVal: number; colorClass: string }) {
  return (
    <div className="space-y-2.5">
      {data.map(d => (
        <div key={d.label} className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span className="font-medium">{d.label}</span>
            <span className="font-mono">{d.value > 0 ? formatPrice(d.value, 'USD') : '—'}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
              style={{ width: maxVal > 0 ? `${Math.max(2, (d.value / maxVal) * 100)}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className={`bg-white border rounded-xl px-5 py-4 ${color ? `border-t-2 ${color}` : 'border-slate-200'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Export controls ───────────────────────────────────────────────────────────

function ExportBar() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function download(type: string) {
    const params = new URLSearchParams({ type });
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    window.location.href = `/api/admin/export?${params}`;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Export Data</h2>
          <p className="text-xs text-slate-400 mt-0.5">Download CSV files for accounting, CRM, or analysis</p>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'orders',       label: '📦 Orders' },
            { type: 'quotes',       label: '📋 Quotes' },
            { type: 'customers',    label: '🏢 Customers' },
            { type: 'distributors', label: '🤝 Distributors' },
          ].map(e => (
            <button key={e.type} onClick={() => download(e.type)}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
              {e.label} ↓
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxRevenue = data ? Math.max(...data.monthly.map(m => m.revenue), 1) : 1;
  const totalRevenue = data?.monthly.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const totalCollected = data?.monthly.reduce((s, m) => s + m.collected, 0) ?? 0;
  const totalOrdersInPeriod = data?.monthly.reduce((s, m) => s + m.orderCount, 0) ?? 0;

  const topProductMax = data?.topProducts.length ? Math.max(...data.topProducts.map(p => p.totalRevenue), 1) : 1;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Business Intelligence</p>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Revenue, pipeline, product and partner analytics</p>
        </div>
        <button onClick={fetchData} className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-slate-400 text-sm">Could not load report data.</p>
      ) : (
        <>
          {/* ── KPI strip ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="12-month Revenue" value={formatPrice(totalRevenue, 'USD')} sub="All orders" color="border-t-brand-500" />
            <StatCard label="Collected" value={formatPrice(totalCollected, 'USD')} sub={`${totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0}% collection rate`} color="border-t-emerald-500" />
            <StatCard label="Orders (12mo)" value={totalOrdersInPeriod} sub="Across all statuses" color="border-t-blue-500" />
            <StatCard label="Quote Conversion" value={`${data.quoteConversionRate}%`} sub={`${data.convertedQuotes} of ${data.totalQuotes} quotes`} color="border-t-purple-500" />
          </section>

          {/* ── Revenue by month ── */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Monthly Revenue</h2>
                <p className="text-xs text-slate-400 mt-0.5">Last 12 months</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-500 inline-block"/>Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"/>Collected</span>
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-40">
              {data.monthly.map(m => {
                const revPct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                const colPct = maxRevenue > 0 ? (m.collected / maxRevenue) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end gap-0.5 h-32">
                      <div className="flex-1 bg-brand-100 rounded-t transition-all duration-500 group-hover:bg-brand-200"
                        style={{ height: `${revPct}%`, minHeight: m.revenue > 0 ? '4px' : '0' }} />
                      <div className="flex-1 bg-emerald-400 rounded-t transition-all duration-500"
                        style={{ height: `${colPct}%`, minHeight: m.collected > 0 ? '4px' : '0' }} />
                      {m.revenue > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10">
                          {formatPrice(m.revenue, 'USD')}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{shortMonth(m.month)}</span>
                    {m.orderCount > 0 && <span className="text-[9px] text-slate-300">{m.orderCount}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Pipeline + Quotes ── */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order pipeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">Order Pipeline</h2>
              <div className="space-y-3">
                {data.ordersByStatus.length === 0 ? (
                  <p className="text-xs text-slate-400">No order data yet</p>
                ) : data.ordersByStatus.map(s => {
                  const maxCount = Math.max(...data.ordersByStatus.map(r => r.count), 1);
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium capitalize text-slate-700">{s.status}</span>
                        <span className="text-slate-500">{s.count} orders · {s.value ? formatPrice(s.value, 'USD') : '—'}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${STATUS_COLOR[s.status] ?? 'bg-slate-400'}`}
                          style={{ width: `${Math.max(2, (s.count / maxCount) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quote funnel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Quote Funnel</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.quoteConversionRate >= 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {data.quoteConversionRate}% converted
                </span>
              </div>
              <div className="space-y-3">
                {data.quotesByStatus.length === 0 ? (
                  <p className="text-xs text-slate-400">No quote data yet</p>
                ) : data.quotesByStatus.map(s => {
                  const maxCount = Math.max(...data.quotesByStatus.map(r => r.count), 1);
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium capitalize text-slate-700">{s.status}</span>
                        <span className="text-slate-500">{s.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${STATUS_COLOR[s.status] ?? 'bg-slate-400'}`}
                          style={{ width: `${Math.max(2, (s.count / maxCount) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Top products ── */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-5">Top Products by Revenue</h2>
            {data.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400">No order items yet — add orders to see product analytics.</p>
            ) : (
              <div className="space-y-4">
                {data.topProducts.map((p, i) => (
                  <div key={p.productSlug} className="flex items-center gap-4">
                    <span className="w-6 text-center text-sm font-black text-slate-300">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{p.productName}</p>
                        <p className="text-sm font-bold text-slate-900 ml-2 flex-shrink-0">{formatPrice(p.totalRevenue, 'USD')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500 transition-all duration-700"
                            style={{ width: `${Math.max(2, (p.totalRevenue / topProductMax) * 100)}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400 flex-shrink-0">{p.totalQty} kg · {p.orderCount} order{p.orderCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Payment breakdown + Distributor stats ── */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">Payment Breakdown</h2>
              {data.paymentBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400">No payment data yet</p>
              ) : (
                <BarChart
                  data={data.paymentBreakdown.map(r => ({ label: r.status, value: r.value ?? 0 }))}
                  maxVal={Math.max(...data.paymentBreakdown.map(r => r.value ?? 0), 1)}
                  colorClass="bg-brand-500"
                />
              )}
            </div>

            {/* Distributor performance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">Distributor Network</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Active partners', value: data.distributors.approved },
                  { label: 'Pending review', value: data.distributors.pending },
                  { label: 'Quotes submitted', value: data.distributors.quotesSubmitted },
                  { label: 'Quotes converted', value: data.distributors.quotesConverted },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-xl font-black text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {(data.distributors.distRevenue ?? 0) > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">Partner channel revenue</p>
                  <p className="text-lg font-black text-brand-600 mt-0.5">{formatPrice(data.distributors.distRevenue, 'USD')}</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Export ── */}
          <ExportBar />
        </>
      )}
    </div>
  );
}
