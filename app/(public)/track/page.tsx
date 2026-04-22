'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Types ───────────────────────────────────────────────────────────────────

interface TimelineStep {
  key: string;
  label: string;
  desc: string;
  done: boolean;
  active: boolean;
}

interface OrderItem {
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

interface TrackResult {
  type: 'order' | 'quote';
  referenceId: string;
  customerName: string;
  customerCompany?: string;
  // order-specific
  total?: number;
  currency?: string;
  status: string;
  paymentStatus?: string;
  shippingRegion?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  timeline?: TimelineStep[];
  // quote-specific
  quoteStatusMap?: Record<string, string>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

const PAY_BADGE: Record<string, string> = {
  paid:     'bg-emerald-100 text-emerald-700',
  partial:  'bg-amber-100 text-amber-700',
  unpaid:   'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
};

const QUOTE_STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  reviewed:  'bg-blue-100 text-blue-700',
  quoted:    'bg-violet-100 text-violet-700',
  accepted:  'bg-emerald-100 text-emerald-700',
  rejected:  'bg-red-100 text-red-700',
  converted: 'bg-slate-100 text-slate-600',
};

// ── Main ────────────────────────────────────────────────────────────────────

function TrackContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [ref, setRef]     = useState(params.get('ref') ?? '');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState('');
  const [result, setResult]  = useState<TrackResult | null>(null);

  // Auto-lookup when query params are pre-filled
  useEffect(() => {
    if (params.get('ref') && params.get('email')) {
      handleLookup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLookup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ref.trim() || !email.trim()) {
      setError('Please enter both your reference ID and email address.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(
        `/api/track?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setResult(data as TrackResult);
        // Update URL so the page is shareable / bookmarkable
        router.replace(`/track?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(email.trim())}`, { scroll: false });
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-400/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Covestro PC</span>
          </Link>
          <Link href="/portal" className="text-xs text-slate-400 hover:text-white transition-colors">
            Customer Portal →
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-2">
          <p className="text-brand-400 text-xs font-bold uppercase tracking-widest">Order Tracking</p>
          <h1 className="text-3xl font-bold text-white">Track Your Order</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Enter your reference ID and email to get real-time status on your order or quote.
          </p>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleLookup}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reference ID
              </label>
              <input
                type="text"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                placeholder="ORD-XXXXXXXX or QT-XXX"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-400/30 px-4 py-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Looking up…
              </>
            ) : 'Track →'}
          </button>
        </form>

        {/* ── Result ── */}
        {result && (
          <div className="space-y-4">

            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-brand-100 text-xs font-semibold uppercase tracking-widest">
                      {result.type === 'order' ? 'Order' : 'Quote'} Reference
                    </p>
                    <p className="text-white font-mono text-xl font-bold mt-0.5">{result.referenceId}</p>
                  </div>
                  <div className="text-right">
                    {result.type === 'order' && result.total !== undefined && (
                      <p className="text-white text-xl font-black">{fmt(result.total, result.currency)}</p>
                    )}
                    <p className="text-brand-200 text-xs mt-0.5">Placed {fmtDate(result.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold capitalize">
                    {result.status}
                  </span>
                  {result.paymentStatus && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PAY_BADGE[result.paymentStatus] ?? 'bg-white/20 text-white'}`}>
                      {result.paymentStatus}
                    </span>
                  )}
                  {result.shippingRegion && (
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-brand-100 text-xs">
                      📦 {result.shippingRegion}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p className="text-sm text-slate-700 font-medium">
                  {result.customerName}{result.customerCompany ? ` · ${result.customerCompany}` : ''}
                </p>
              </div>

              {/* Quote-specific status message */}
              {result.type === 'quote' && result.quoteStatusMap && (
                <div className="px-6 py-5">
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-4">
                    <span className={`mt-0.5 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${QUOTE_STATUS_BADGE[result.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {result.status}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result.quoteStatusMap[result.status] ?? 'Status update in progress.'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Last updated {fmtDate(result.updatedAt)}
                  </p>
                </div>
              )}

              {/* Order timeline */}
              {result.type === 'order' && result.timeline && (
                <div className="px-6 py-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Status Timeline</h3>
                  <ol className="relative">
                    {result.timeline.map((step, i) => (
                      <li key={step.key} className={`relative flex gap-4 ${i < result.timeline!.length - 1 ? 'pb-6' : ''}`}>
                        {/* Connector line */}
                        {i < result.timeline!.length - 1 && (
                          <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${step.done ? 'bg-brand-400' : 'bg-slate-200'}`} />
                        )}
                        {/* Dot */}
                        <div className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                          step.active
                            ? 'bg-brand-500 border-brand-500 shadow-lg shadow-brand-500/30'
                            : step.done
                              ? step.key === 'cancelled'
                                ? 'bg-red-500 border-red-500'
                                : 'bg-brand-500 border-brand-500'
                              : 'bg-white border-slate-200'
                        }`}>
                          {step.done ? (
                            step.key === 'cancelled' ? (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                          )}
                        </div>
                        {/* Text */}
                        <div className="pt-0.5 min-w-0">
                          <p className={`text-sm font-semibold ${step.active ? 'text-brand-600' : step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.label}
                            {step.active && (
                              <span className="ml-2 inline-flex px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 text-[10px] font-bold uppercase">Current</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Line items */}
              {result.items && result.items.length > 0 && (
                <div className="border-t border-slate-100">
                  <div className="px-6 py-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Items Ordered</h3>
                    <div className="space-y-2">
                      {result.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.productName}</p>
                            <p className="text-xs text-slate-400">{item.qty}{item.unit} × {fmt(item.unitPrice, result.currency)}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                            {fmt(item.lineTotal, result.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                    {result.total !== undefined && (
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-700">Total</p>
                        <p className="text-lg font-black text-slate-900">{fmt(result.total, result.currency)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link href="/portal"
                  className="flex-1 text-center text-sm font-semibold text-brand-600 hover:text-brand-700 bg-white border border-brand-200 rounded-lg py-2.5 transition-colors hover:bg-brand-50">
                  Sign in to Customer Portal
                </Link>
                <Link href="/contact"
                  className="flex-1 text-center text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg py-2.5 transition-colors hover:bg-slate-50">
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Track another */}
            <button
              onClick={() => { setResult(null); setRef(''); setEmail(''); setError(''); router.replace('/track', { scroll: false }); }}
              className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors py-2"
            >
              ← Track a different order
            </button>
          </div>
        )}

        {/* Help text when no result yet */}
        {!result && (
          <div className="text-center text-slate-500 text-xs space-y-1">
            <p>Your reference ID was emailed to you when your order or quote was submitted.</p>
            <p>It looks like <code className="bg-white/10 px-1 rounded text-slate-300">ORD-XXXXXXXX</code> for orders or <code className="bg-white/10 px-1 rounded text-slate-300">QT-XXXXX</code> for quotes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
