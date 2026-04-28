'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/pricing';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RecentOrder {
  id: string;
  referenceId: string;
  customerName: string;
  customerCompany?: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}
interface RecentQuote {
  id: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  currency: string;
  createdAt: string;
}
interface RecentDist {
  id: string;
  fullName: string;
  companyName: string;
  status: string;
  discountTier?: string;
  createdAt: string;
}
interface DashboardData {
  revenue: { total: number; paid: number; unpaid: number; partial: number; outstanding: number };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    needsAttention: number;
    unpaid: number;
  };
  quotes: { total: number; byStatus: Record<string, number>; pending: number };
  distributors: {
    byStatus: Record<string, number>;
    pending: number;
    approved: number;
    distQuotesPending: number;
  };
  recent: { orders: RecentOrder[]; quotes: RecentQuote[]; distributors: RecentDist[] };
}

// ── Helper components ─────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function today() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50',
  confirmed: 'text-blue-600 bg-blue-50',
  processing: 'text-purple-600 bg-purple-50',
  shipped: 'text-sky-600 bg-sky-50',
  delivered: 'text-emerald-600 bg-emerald-50',
  cancelled: 'text-slate-400 bg-slate-100',
};
const PAY_COLOR: Record<string, string> = {
  unpaid: 'text-red-600',
  partial: 'text-amber-600',
  paid: 'text-emerald-600',
  refunded: 'text-slate-400',
};
const QUOTE_STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600',
  reviewed: 'text-blue-600',
  quoted: 'text-purple-600',
  accepted: 'text-emerald-600',
  rejected: 'text-red-600',
  converted: 'text-slate-500',
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-slate-500 w-5 text-right">{value}</span>
    </div>
  );
}

function AttentionCard({
  count,
  label,
  sub,
  href,
  tone,
}: {
  count: number;
  label: string;
  sub?: string;
  href: string;
  tone: 'amber' | 'red' | 'blue';
}) {
  if (!count) return null;
  const colors = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
    red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  };
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${colors[tone]}`}
    >
      <span className="text-2xl font-black">{count}</span>
      <div>
        <p className="text-sm font-semibold leading-tight">{label}</p>
        {sub && <p className="text-[11px] opacity-70 mt-0.5">{sub}</p>}
      </div>
      <svg
        className="w-4 h-4 ml-auto opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'quotes' | 'distributors'>('orders');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxOrderCount = data ? Math.max(...Object.values(data.orders.byStatus), 1) : 1;
  const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];
  const ORDER_BAR_COLORS: Record<string, string> = {
    pending: 'bg-amber-400',
    confirmed: 'bg-blue-400',
    processing: 'bg-purple-400',
    shipped: 'bg-sky-400',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-slate-300',
  };

  const attentionItems = data
    ? [
        {
          count: data.quotes.pending,
          label: 'Quotes to review',
          sub: 'Awaiting your response',
          href: '/admin/quotes?status=pending',
          tone: 'amber' as const,
        },
        {
          count: data.orders.byStatus['pending'] ?? 0,
          label: 'Orders to confirm',
          sub: 'Newly created, not yet confirmed',
          href: '/admin/orders?status=pending',
          tone: 'amber' as const,
        },
        {
          count: data.distributors.distQuotesPending,
          label: 'Partner quotes pending',
          sub: 'From distributor portal',
          href: '/admin/distributors',
          tone: 'blue' as const,
        },
        {
          count: data.distributors.pending,
          label: 'Distributor applications',
          sub: 'Awaiting approval decision',
          href: '/admin/distributors',
          tone: 'blue' as const,
        },
        {
          count:
            (data.orders.byStatus['confirmed'] ?? 0) + (data.orders.byStatus['processing'] ?? 0),
          label: 'Unpaid active orders',
          sub: 'Confirmed or processing, not yet paid',
          href: '/admin/orders',
          tone: 'red' as const,
        },
      ].filter((a) => a.count > 0)
    : [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
            {today()}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{greeting()}, Admin</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here&apos;s what needs your attention today
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href="/admin/orders/new"
            className="px-3 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            + New Order
          </Link>
          <Link
            href="/admin/quotes/new"
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            + New Quote
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-slate-400 text-sm py-8">Could not load dashboard data.</p>
      ) : (
        <>
          {/* ── Needs attention ── */}
          {attentionItems.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Needs attention
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attentionItems.map((a) => (
                  <AttentionCard key={a.label} {...a} />
                ))}
              </div>
            </section>
          )}

          {attentionItems.length === 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
              <svg
                className="w-5 h-5 text-emerald-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-emerald-700">
                All caught up — no pending actions right now.
              </p>
            </div>
          )}

          {/* ── Revenue + Pipeline ── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revenue card */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Revenue
                </h2>
                <Link href="/admin/orders" className="text-xs text-brand-600 hover:underline">
                  View all orders →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total invoiced', value: data.revenue.total, color: 'text-slate-900' },
                  { label: 'Collected', value: data.revenue.paid, color: 'text-emerald-600' },
                  { label: 'Outstanding', value: data.revenue.outstanding, color: 'text-red-600' },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-[11px] text-slate-400 font-medium">{r.label}</p>
                    <p className={`text-xl font-black mt-0.5 ${r.color}`}>
                      {formatPrice(r.value, 'USD')}
                    </p>
                  </div>
                ))}
              </div>
              {/* Collection progress bar */}
              {data.revenue.total > 0 && (
                <div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-700"
                      style={{ width: `${(data.revenue.paid / data.revenue.total) * 100}%` }}
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-700"
                      style={{ width: `${(data.revenue.partial / data.revenue.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Paid{' '}
                      {data.revenue.total > 0
                        ? Math.round((data.revenue.paid / data.revenue.total) * 100)
                        : 0}
                      %
                    </span>
                    <span className="text-[10px] text-amber-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Partial
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> Unpaid
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Order pipeline
                </h2>
                <span className="text-xs text-slate-400">{data.orders.total} total</span>
              </div>
              <div className="space-y-2">
                {ORDER_STATUSES.filter((s) => (data.orders.byStatus[s] ?? 0) > 0).map((s) => (
                  <div key={s} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-medium capitalize text-slate-600">{s}</span>
                    </div>
                    <MiniBar
                      value={data.orders.byStatus[s] ?? 0}
                      max={maxOrderCount}
                      color={ORDER_BAR_COLORS[s] ?? 'bg-slate-400'}
                    />
                  </div>
                ))}
                {data.orders.total === 0 && (
                  <p className="text-xs text-slate-400 py-2">No orders yet</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Partner & Lead stats ── */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Active distributors',
                value: data.distributors.approved,
                href: '/admin/distributors',
                sub: 'Approved partners',
                color: 'border-t-2 border-t-violet-400',
              },
              {
                label: 'Pending applications',
                value: data.distributors.pending,
                href: '/admin/distributors',
                sub: 'Awaiting review',
                color: 'border-t-2 border-t-amber-400',
              },
              {
                label: 'Contact enquiries',
                value: 0,
                href: '/admin/submissions?type=contact',
                sub: 'Total received',
                color: 'border-t-2 border-t-blue-400',
              },
              {
                label: 'Pending quotes',
                value: data.quotes.pending,
                href: '/admin/quotes?status=pending',
                sub: 'Needs response',
                color: 'border-t-2 border-t-rose-400',
              },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all ${s.color}`}
              >
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">{s.label}</p>
                <p className="text-[11px] text-slate-400">{s.sub}</p>
              </Link>
            ))}
          </section>

          {/* ── Recent activity ── */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Recent activity
              </h2>
              <div className="flex items-center gap-1">
                {(['orders', 'quotes', 'distributors'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize leading-none transition-colors ${
                      tab === t
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders */}
            {tab === 'orders' && (
              <div className="divide-y divide-slate-100">
                {data.recent.orders.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">No orders yet</div>
                ) : (
                  data.recent.orders.map((o) => (
                    <Link
                      key={o.id}
                      href="/admin/orders"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">{o.referenceId}</span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${ORDER_STATUS_COLOR[o.status] ?? ''}`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate mt-0.5">
                          {o.customerName}
                          {o.customerCompany ? ` · ${o.customerCompany}` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {formatPrice(o.total, o.currency as 'USD' | 'AUD')}
                        </p>
                        <p
                          className={`text-[11px] font-semibold capitalize ${PAY_COLOR[o.paymentStatus] ?? ''}`}
                        >
                          {o.paymentStatus}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 flex-shrink-0 w-14 text-right">
                        {timeAgo(o.createdAt)}
                      </p>
                    </Link>
                  ))
                )}
                <div className="px-5 py-3 border-t border-slate-100">
                  <Link
                    href="/admin/orders"
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    View all orders →
                  </Link>
                </div>
              </div>
            )}

            {/* Quotes */}
            {tab === 'quotes' && (
              <div className="divide-y divide-slate-100">
                {data.recent.quotes.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">No quotes yet</div>
                ) : (
                  data.recent.quotes.map((q) => (
                    <Link
                      key={q.id}
                      href="/admin/quotes"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">{q.referenceId}</span>
                          <span
                            className={`text-[11px] font-semibold capitalize ${QUOTE_STATUS_COLOR[q.status] ?? ''}`}
                          >
                            {q.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate mt-0.5">
                          {q.customerName} · {q.customerEmail}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 flex-shrink-0 w-14 text-right">
                        {timeAgo(q.createdAt)}
                      </p>
                    </Link>
                  ))
                )}
                <div className="px-5 py-3 border-t border-slate-100">
                  <Link
                    href="/admin/quotes"
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    View all quotes →
                  </Link>
                </div>
              </div>
            )}

            {/* Distributors */}
            {tab === 'distributors' && (
              <div className="divide-y divide-slate-100">
                {data.recent.distributors.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    No applications yet
                  </div>
                ) : (
                  data.recent.distributors.map((d) => {
                    const statusColor: Record<string, string> = {
                      pending: 'text-amber-600',
                      reviewed: 'text-blue-600',
                      approved: 'text-emerald-600',
                      rejected: 'text-red-500',
                    };
                    return (
                      <Link
                        key={d.id}
                        href="/admin/distributors"
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{d.fullName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{d.companyName}</p>
                        </div>
                        <span
                          className={`text-[11px] font-semibold capitalize flex-shrink-0 ${statusColor[d.status] ?? 'text-slate-400'}`}
                        >
                          {d.status}
                        </span>
                        <p className="text-[11px] text-slate-400 flex-shrink-0 w-14 text-right">
                          {timeAgo(d.createdAt)}
                        </p>
                      </Link>
                    );
                  })
                )}
                <div className="px-5 py-3 border-t border-slate-100">
                  <Link
                    href="/admin/distributors"
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    View all applications →
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* ── Quick actions ── */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Quick actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Create Order',
                  href: '/admin/orders/new',
                  icon: '📦',
                  desc: 'Manual order entry',
                },
                {
                  label: 'Create Quote',
                  href: '/admin/quotes/new',
                  icon: '📋',
                  desc: 'Log phone/email quote',
                },
                {
                  label: 'Add Customer',
                  href: '/admin/customers',
                  icon: '🏢',
                  desc: 'New customer record',
                },
                {
                  label: 'View Submissions',
                  href: '/admin/submissions',
                  icon: '📥',
                  desc: 'Web enquiries inbox',
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-4 hover:border-brand-300 hover:shadow-sm transition-all"
                >
                  <span className="text-xl">{a.icon}</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1.5">{a.label}</p>
                  <p className="text-[11px] text-slate-400">{a.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
