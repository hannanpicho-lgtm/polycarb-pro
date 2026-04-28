'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/pricing';
import type { Currency } from '@/lib/pricing';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

interface PortalOrder {
  id: string;
  referenceId: string;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
}

interface PortalQuote {
  id: string;
  referenceId: string;
  currency: string;
  status: string;
  products: string;
  quotedAmount: number | null;
  createdAt: string;
  respondedAt: string | null;
}

interface CustomerProfile {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  region?: string;
  currency?: string;
}

interface MeResponse {
  email: string;
  customer: CustomerProfile | null;
  orders: PortalOrder[];
  quotes: PortalQuote[];
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};
const PAY_COLOR: Record<PaymentStatus, string> = {
  unpaid: 'text-red-600',
  partial: 'text-amber-600',
  paid: 'text-emerald-600',
  refunded: 'text-slate-400',
};

function OrderStatusBar({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  if (status === 'cancelled') {
    return <p className="text-xs text-red-500 font-medium">Order cancelled</p>;
  }
  const current = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border transition-colors ${
              i <= current ? 'bg-brand-500 border-brand-500' : 'bg-slate-200 border-slate-300'
            }`}
          />
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-0 transition-colors ${i < current ? 'bg-brand-500' : 'bg-slate-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function PortalDashboard() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'quotes'>('orders');
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ quoteId: string; ok: boolean; msg: string } | null>(
    null
  );

  const reload = () => {
    fetch('/api/portal/me')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/portal');
          return;
        }
        if (res.ok) setData(await res.json());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleQuoteAction(quoteId: string, action: 'accept' | 'decline') {
    setActingOn(quoteId);
    setActionMsg(null);
    try {
      const res = await fetch('/api/portal/quotes/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action }),
      });
      const d = (await res.json()) as {
        ok?: boolean;
        action?: string;
        orderReferenceId?: string;
        error?: string;
      };
      if (!res.ok) {
        setActionMsg({ quoteId, ok: false, msg: d.error ?? 'Failed' });
        return;
      }
      const msg =
        action === 'accept'
          ? `✓ Quote accepted! Order ${d.orderReferenceId} created.`
          : '✓ Quote declined.';
      setActionMsg({ quoteId, ok: true, msg });
      setTimeout(() => {
        setActionMsg(null);
        reload();
      }, 3000);
    } catch {
      setActionMsg({ quoteId, ok: false, msg: 'Network error' });
    } finally {
      setActingOn(null);
    }
  }

  async function handleSignOut() {
    await fetch('/api/portal/me', { method: 'DELETE' });
    router.replace('/portal');
  }

  const name = data?.customer
    ? `${data.customer.firstName ?? ''} ${data.customer.lastName ?? ''}`.trim() || data.email
    : (data?.email ?? '');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-400/30 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-brand-500"
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
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-none">My Portal</p>
            <p className="text-[10px] text-slate-400">Covestro PC</p>
          </div>
        </Link>
        {data && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{data.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mx-auto" />
          </div>
        ) : !data ? (
          <div className="py-20 text-center text-slate-400">
            Unable to load your data.{' '}
            <Link href="/portal" className="text-brand-600 hover:underline">
              Sign in again
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {name ? `Welcome back, ${name.split(' ')[0]}` : 'My Account'}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {data.orders.length} orders · {data.quotes.length} quotes
                </p>
              </div>
              <Link
                href="/contact"
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors"
              >
                New Enquiry
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Orders', value: data.orders.length },
                {
                  label: 'Active Orders',
                  value: data.orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
                    .length,
                },
                {
                  label: 'Pending Payment',
                  value: data.orders.filter((o) => o.paymentStatus === 'unpaid').length,
                },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-slate-100">
                {(['orders', 'quotes'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-5 py-3.5 text-sm font-medium capitalize transition-colors ${
                      tab === t
                        ? 'text-brand-600 border-b-2 border-brand-500'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t} {t === 'orders' ? `(${data.orders.length})` : `(${data.quotes.length})`}
                  </button>
                ))}
              </div>

              {/* Orders tab */}
              {tab === 'orders' && (
                <div className="divide-y divide-slate-100">
                  {data.orders.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">No orders yet</div>
                  ) : (
                    data.orders.map((order) => (
                      <div key={order.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-slate-500">
                                {order.referenceId}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ORDER_STATUS_COLOR[order.status]}`}
                              >
                                {ORDER_STATUS_LABEL[order.status]}
                              </span>
                              <span
                                className={`text-xs font-semibold capitalize ${PAY_COLOR[order.paymentStatus]}`}
                              >
                                {order.paymentStatus}
                              </span>
                            </div>
                            <OrderStatusBar status={order.status} />
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                              <span>Placed {new Date(order.createdAt).toLocaleDateString()}</span>
                              {order.shippedAt && (
                                <span>
                                  Shipped {new Date(order.shippedAt).toLocaleDateString()}
                                </span>
                              )}
                              {order.trackingNumber && (
                                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  Track: {order.trackingNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-slate-900 text-lg">
                              {formatPrice(order.total, order.currency as Currency)}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{order.currency}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Quotes tab */}
              {tab === 'quotes' && (
                <div className="divide-y divide-slate-100">
                  {data.quotes.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      No quotes yet —
                      <Link href="/contact" className="ml-1 text-brand-600 hover:underline">
                        submit an enquiry
                      </Link>
                    </div>
                  ) : (
                    data.quotes.map((q) => {
                      const QUOTE_COLOR: Record<string, string> = {
                        pending: 'bg-amber-50 text-amber-700 border-amber-200',
                        reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
                        quoted: 'bg-purple-50 text-purple-700 border-purple-200',
                        accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        rejected: 'bg-red-50 text-red-700 border-red-200',
                        converted: 'bg-slate-100 text-slate-600 border-slate-200',
                      };
                      let products: Array<{
                        productName?: string;
                        productSlug?: string;
                        qty?: string;
                      }> = [];
                      try {
                        products = JSON.parse(q.products);
                      } catch {}
                      const isPriced = q.status === 'quoted' && !!q.quotedAmount;
                      return (
                        <div
                          key={q.id}
                          className={`p-5 transition-colors ${isPriced ? 'bg-purple-50/40 hover:bg-purple-50/70' : 'hover:bg-slate-50/50'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-slate-500">
                                  {q.referenceId}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${QUOTE_COLOR[q.status] ?? ''}`}
                                >
                                  {q.status === 'quoted' ? '💬 Price received' : q.status}
                                </span>
                              </div>
                              {products.length > 0 && (
                                <p className="text-sm text-slate-600 mt-1.5">
                                  {products
                                    .map(
                                      (p) =>
                                        `${p.productName ?? p.productSlug}${p.qty ? ` × ${p.qty}` : ''}`
                                    )
                                    .join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 mt-1">
                                Submitted {new Date(q.createdAt).toLocaleDateString()}
                              </p>

                              {/* Accept / Decline for priced quotes */}
                              {isPriced && (
                                <div className="mt-3 flex items-center gap-3 flex-wrap">
                                  <button
                                    onClick={() => handleQuoteAction(q.id, 'accept')}
                                    disabled={actingOn === q.id}
                                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    {actingOn === q.id ? (
                                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                    ) : (
                                      '✓'
                                    )}
                                    Accept &amp; Place Order
                                  </button>
                                  <button
                                    onClick={() => handleQuoteAction(q.id, 'decline')}
                                    disabled={actingOn === q.id}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                  >
                                    Decline
                                  </button>
                                  {actionMsg?.quoteId === q.id && (
                                    <span
                                      className={`text-xs font-semibold ${actionMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}
                                    >
                                      {actionMsg.msg}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {q.quotedAmount && (
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-slate-900 text-xl">
                                  {formatPrice(q.quotedAmount, q.currency as Currency)}
                                </p>
                                <p className="text-xs text-slate-400">Quoted price</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Help footer */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4.5 h-4.5 text-brand-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-800">Need help with an order?</p>
                <p className="text-xs text-brand-600 mt-0.5">
                  Our team is available Mon–Fri 8am–5pm AEST.
                </p>
                <Link
                  href="/contact"
                  className="inline-block mt-2 text-xs font-medium text-brand-700 hover:text-brand-900 underline"
                >
                  Contact us →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
