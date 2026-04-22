'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type QuoteStatus = 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'rejected' | 'converted';

interface Quote {
  id: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  currency: string;
  status: QuoteStatus;
  products: string; // JSON string
  message?: string;
  adminNotes?: string;
  quotedAmount?: number;
  source: string;
  createdAt: string;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  pending:   'Pending',
  reviewed:  'Reviewed',
  quoted:    'Quoted',
  accepted:  'Accepted',
  rejected:  'Rejected',
  converted: 'Converted',
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  reviewed:  'bg-blue-50 text-blue-700 border-blue-200',
  quoted:    'bg-purple-50 text-purple-700 border-purple-200',
  accepted:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  converted: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ALL_STATUSES: QuoteStatus[] = ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'converted'];

function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function QuotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const page = 1;
  const pageSize = 20;

  const fetchQuotes = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ limit: String(pageSize), offset: '0', search });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/quotes?${params}`);
      if (res.status === 401) { router.replace('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setQuotes(data.quotes ?? []);
      setTotal(data.total ?? 0);
    } catch { setError('Failed to load quotes'); }
    finally { setLoading(false); }
  }, [search, statusFilter, router]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  async function updateStatus(id: string, status: QuoteStatus, adminNotes?: string, quotedAmount?: number) {
    setUpdatingId(id);
    try {
      await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, adminNotes, quotedAmount, respondedAt: new Date().toISOString() }),
      });
      fetchQuotes();
    } finally { setUpdatingId(null); }
  }

  async function convertToOrder(quote: Quote) {
    router.push(`/admin/orders/new?quoteId=${quote.id}&customerEmail=${encodeURIComponent(quote.customerEmail)}&customerName=${encodeURIComponent(quote.customerName)}&currency=${quote.currency}`);
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export?type=quotes" className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            ↓ CSV
          </a>
          <Link href="/admin/quotes/new" className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
            + New Quote
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 flex-wrap">
          {(['', ...ALL_STATUSES] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s ? STATUS_LABELS[s as QuoteStatus] : 'All'}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email…"
          className="ml-auto px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : quotes.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No quotes yet</p>
              <p className="text-xs text-slate-400 mt-1">Create one manually below, or customers can submit via the live quote builder</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/admin/quotes/new"
                className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
                + Create Quote Manually
              </Link>
              <a href="/quote/builder" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Open Quote Builder ↗
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Or use the <strong>Quote Builder</strong> at <code className="bg-slate-100 px-1 rounded">covestroppc.com/quote/builder</code> as a customer to test the end-to-end flow
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Ref', 'Customer', 'Email', 'Currency', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map(q => {
                const isExpanded = expandedId === q.id;
                const products = (() => { try { return JSON.parse(q.products); } catch { return []; } })();
                return (
                  <>
                    <tr key={q.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{q.referenceId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{q.customerName}<br/><span className="text-xs text-slate-400 font-normal">{q.customerCompany}</span></td>
                      <td className="px-4 py-3 text-slate-600">{q.customerEmail}</td>
                      <td className="px-4 py-3 text-slate-600">{q.currency}</td>
                      <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{isExpanded ? '▲' : '▼'}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${q.id}-detail`} className="bg-slate-50/60">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              {q.message && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Customer message</p>
                                  <p className="text-sm text-slate-700 mt-1">{q.message}</p>
                                </div>
                              )}
                              {products.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Products requested</p>
                                  <ul className="mt-1 space-y-0.5">
                                    {products.map((p: Record<string, string>, i: number) => (
                                      <li key={i} className="text-sm text-slate-700">· {p.productName ?? p.productSlug} {p.qty ? `× ${p.qty} kg` : ''}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Admin notes</p>
                                <p className="text-sm text-slate-600 mt-1">{q.adminNotes || '—'}</p>
                              </div>
                              {q.quotedAmount && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Quoted amount</p>
                                  <p className="text-sm font-semibold text-slate-900 mt-1">{q.currency} {q.quotedAmount.toFixed(2)}</p>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {q.status === 'pending' && (
                                  <button onClick={(e) => { e.stopPropagation(); updateStatus(q.id, 'reviewed'); }}
                                    disabled={updatingId === q.id}
                                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    Mark Reviewed
                                  </button>
                                )}
                                {(q.status === 'reviewed' || q.status === 'pending') && (
                                  <button onClick={(e) => { e.stopPropagation(); updateStatus(q.id, 'rejected'); }}
                                    disabled={updatingId === q.id}
                                    className="px-3 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                    Reject
                                  </button>
                                )}
                                {q.status !== 'converted' && q.status !== 'rejected' && (
                                  <button onClick={(e) => { e.stopPropagation(); convertToOrder(q); }}
                                    className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                                    Convert to Order →
                                  </button>
                                )}
                                <a href={`/print/quote/${q.id}`} target="_blank" rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                  🖨 Quote PDF
                                </a>
                              </div>
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
        )}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  return <Suspense><QuotesContent /></Suspense>;
}
