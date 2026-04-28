'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────────

interface OrderHit {
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
interface QuoteHit {
  id: string;
  referenceId: string;
  customerName: string;
  customerCompany?: string;
  currency: string;
  status: string;
  createdAt: string;
}
interface CustomerHit {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface SearchResults {
  orders: OrderHit[];
  quotes: QuoteHit[];
  customers: CustomerHit[];
}

type ResultItem =
  | { kind: 'order'; data: OrderHit }
  | { kind: 'quote'; data: QuoteHit }
  | { kind: 'customer'; data: CustomerHit };

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600',
  confirmed: 'text-blue-600',
  processing: 'text-purple-600',
  shipped: 'text-sky-600',
  delivered: 'text-emerald-600',
  cancelled: 'text-slate-400',
  reviewed: 'text-blue-600',
  quoted: 'text-violet-600',
  accepted: 'text-emerald-600',
  rejected: 'text-red-500',
  converted: 'text-slate-400',
};

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 250);

  // ── Keyboard shortcut: Ctrl+K / Cmd+K ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
      setCursor(0);
    }
  }, [open]);

  // ── Fetch results ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d as SearchResults);
        setCursor(0);
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // ── Flatten results for keyboard nav ────────────────────────────────────────
  const flatItems: ResultItem[] = results
    ? [
        ...results.orders.map((o) => ({ kind: 'order' as const, data: o })),
        ...results.quotes.map((q) => ({ kind: 'quote' as const, data: q })),
        ...results.customers.map((c) => ({ kind: 'customer' as const, data: c })),
      ]
    : [];

  const handleSelect = useCallback(
    (item: ResultItem) => {
      if (item.kind === 'order') router.push('/admin/orders');
      if (item.kind === 'quote') router.push('/admin/quotes');
      if (item.kind === 'customer') router.push('/admin/customers');
      setOpen(false);
    },
    [router]
  );

  // Keyboard navigation within results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!flatItems.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, flatItems.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === 'Enter' && flatItems[cursor]) {
      e.preventDefault();
      handleSelect(flatItems[cursor]);
    }
  };

  const totalHits = flatItems.length;
  const isEmpty = results && totalHits === 0;

  return (
    <>
      {/* Trigger button in the sidebar */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
      >
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
          />
        </svg>
        <span className="flex-1 text-left text-xs">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
          ⌘K
        </kbd>
      </button>

      {/* Palette overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="palette"
              className="fixed inset-x-0 top-16 z-50 mx-auto max-w-xl px-4 pointer-events-none"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <svg
                      className="w-4 h-4 text-slate-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
                      />
                    </svg>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search orders, quotes, customers…"
                    className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                  <kbd
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
                  >
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[480px] overflow-y-auto">
                  {!query && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-slate-400">
                        Type to search across orders, quotes and customers
                      </p>
                    </div>
                  )}

                  {query && query.length < 2 && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-slate-400">Type at least 2 characters…</p>
                    </div>
                  )}

                  {isEmpty && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-slate-500">
                        No results for <strong>&ldquo;{query}&rdquo;</strong>
                      </p>
                    </div>
                  )}

                  {results && totalHits > 0 && (
                    <div className="py-2">
                      {/* Orders */}
                      {results.orders.length > 0 && (
                        <section>
                          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Orders
                          </p>
                          {results.orders.map((o, i) => {
                            const globalIdx = i;
                            return (
                              <button
                                key={o.id}
                                onClick={() => handleSelect({ kind: 'order', data: o })}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${cursor === globalIdx ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                                onMouseEnter={() => setCursor(globalIdx)}
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-3.5 h-3.5 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-slate-500">
                                      {o.referenceId}
                                    </span>
                                    <span
                                      className={`text-[10px] font-semibold capitalize ${STATUS_COLOR[o.status] ?? ''}`}
                                    >
                                      {o.status}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {o.customerName}
                                    {o.customerCompany ? ` · ${o.customerCompany}` : ''}
                                  </p>
                                </div>
                                <span className="text-xs font-bold text-slate-700 flex-shrink-0">
                                  {fmt(o.total, o.currency)}
                                </span>
                              </button>
                            );
                          })}
                        </section>
                      )}

                      {/* Quotes */}
                      {results.quotes.length > 0 && (
                        <section className="mt-1">
                          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Quotes
                          </p>
                          {results.quotes.map((q, i) => {
                            const globalIdx = results.orders.length + i;
                            return (
                              <button
                                key={q.id}
                                onClick={() => handleSelect({ kind: 'quote', data: q })}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${cursor === globalIdx ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                                onMouseEnter={() => setCursor(globalIdx)}
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-3.5 h-3.5 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-slate-500">
                                      {q.referenceId}
                                    </span>
                                    <span
                                      className={`text-[10px] font-semibold capitalize ${STATUS_COLOR[q.status] ?? ''}`}
                                    >
                                      {q.status}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {q.customerName}
                                    {q.customerCompany ? ` · ${q.customerCompany}` : ''}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </section>
                      )}

                      {/* Customers */}
                      {results.customers.length > 0 && (
                        <section className="mt-1">
                          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Customers
                          </p>
                          {results.customers.map((c, i) => {
                            const globalIdx = results.orders.length + results.quotes.length + i;
                            return (
                              <button
                                key={c.id}
                                onClick={() => handleSelect({ kind: 'customer', data: c })}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${cursor === globalIdx ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                                onMouseEnter={() => setCursor(globalIdx)}
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-3.5 h-3.5 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800">
                                    {c.firstName} {c.lastName}
                                    {c.company ? ` · ${c.company}` : ''}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">{c.email}</p>
                                </div>
                              </button>
                            );
                          })}
                        </section>
                      )}

                      {/* Footer hint */}
                      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">
                          {totalHits} result{totalHits !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>
                            <kbd className="font-semibold">↑↓</kbd> navigate
                          </span>
                          <span>
                            <kbd className="font-semibold">↵</kbd> open
                          </span>
                          <span>
                            <kbd className="font-semibold">ESC</kbd> close
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
