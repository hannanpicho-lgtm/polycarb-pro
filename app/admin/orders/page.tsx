'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { formatPrice } from '@/lib/pricing';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

interface Order {
  id: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: string;
}

const ORDER_STATUS: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const PAY_STATUS: Record<PaymentStatus, string> = {
  unpaid: 'bg-red-50 text-red-700 border-red-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-slate-100 text-slate-500 border-slate-200',
};

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<{ id: string; url: string } | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [notifyNote, setNotifyNote] = useState<Record<string, string>>({});
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ limit: '20', offset: '0', search });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.status === 401) { router.replace('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch { setError('Failed to load orders'); }
    finally { setLoading(false); }
  }, [search, statusFilter, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateOrder(id: string, patch: Partial<Order & { confirmedAt?: string; shippedAt?: string; deliveredAt?: string }>) {
    setUpdatingId(id);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      fetchOrders();
    } finally { setUpdatingId(null); }
  }

  async function sendStatusEmail(orderId: string) {
    setNotifyingId(orderId);
    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, customNote: notifyNote[orderId] || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifySuccess(orderId);
      setTimeout(() => setNotifySuccess(null), 4000);
    } catch (err) {
      alert(`Notify failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally { setNotifyingId(null); }
  }

  async function sendInvoice(orderId: string) {
    setInvoicingId(orderId);
    try {
      const res = await fetch('/api/stripe/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, sendEmail: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoiceResult({ id: orderId, url: data.invoiceUrl });
      fetchOrders();
    } catch (err) {
      alert(`Invoice failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally { setInvoicingId(null); }
  }

  function nextStatus(current: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? (flow[idx + 1] ?? null) : null;
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export?type=orders" className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            ↓ CSV
          </a>
          <Link href="/admin/orders/new" className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
            + New Order
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 flex-wrap">
          {(['', ...ORDER_STATUSES] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search…" className="ml-auto px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No orders yet —
            <Link href="/admin/orders/new" className="ml-1 text-brand-600 hover:underline">create one</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Ref', 'Customer', 'Total', 'Order Status', 'Payment', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(o => {
                const isExpanded = expandedId === o.id;
                const next = nextStatus(o.status);
                return (
                  <>
                    <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.referenceId}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{o.customerName}</p>
                        <p className="text-xs text-slate-400">{o.customerCompany}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(o.total, o.currency as 'USD' | 'AUD')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ORDER_STATUS[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PAY_STATUS[o.paymentStatus]}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{isExpanded ? '▲' : '▼'}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${o.id}-detail`} className="bg-slate-50/60">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Detail label="Email" value={o.customerEmail} />
                              <Detail label="Subtotal" value={formatPrice(o.subtotal, o.currency as 'USD' | 'AUD')} />
                              <Detail label="Shipping" value={formatPrice(o.shippingCost, o.currency as 'USD' | 'AUD')} />
                              <Detail label="Total" value={formatPrice(o.total, o.currency as 'USD' | 'AUD')} bold />
                              {o.trackingNumber && <Detail label="Tracking" value={o.trackingNumber} />}
                              {o.adminNotes && <Detail label="Notes" value={o.adminNotes} />}
                            </div>
                            <div className="space-y-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Actions</p>

                              {/* Notify customer */}
                              {o.customerEmail && o.status !== 'pending' && (
                                <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 space-y-2">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                    Email customer ({o.customerEmail})
                                  </p>
                                  <textarea
                                    rows={2}
                                    placeholder="Optional personal note to include…"
                                    value={notifyNote[o.id] ?? ''}
                                    onChange={e => setNotifyNote(p => ({ ...p, [o.id]: e.target.value }))}
                                    onClick={e => e.stopPropagation()}
                                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={e => { e.stopPropagation(); sendStatusEmail(o.id); }}
                                      disabled={notifyingId === o.id}
                                      className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors">
                                      {notifyingId === o.id ? 'Sending…' : `✉ Send "${o.status}" update`}
                                    </button>
                                    {notifySuccess === o.id && (
                                      <span className="text-xs text-emerald-600 font-medium">Email sent ✓</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {next && (
                                  <button onClick={(e) => { e.stopPropagation();
                                    const patch: Record<string, string> = { status: next };
                                    if (next === 'confirmed') patch.confirmedAt = new Date().toISOString();
                                    if (next === 'shipped') patch.shippedAt = new Date().toISOString();
                                    if (next === 'delivered') patch.deliveredAt = new Date().toISOString();
                                    updateOrder(o.id, patch as Partial<Order>);
                                  }}
                                  disabled={updatingId === o.id}
                                  className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 capitalize">
                                    Mark {next}
                                  </button>
                                )}
                                {o.paymentStatus === 'unpaid' && (
                                  <button onClick={(e) => { e.stopPropagation(); sendInvoice(o.id); }}
                                    disabled={invoicingId === o.id}
                                    className="px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50">
                                    {invoicingId === o.id ? 'Sending…' : '⚡ Send Stripe Invoice'}
                                  </button>
                                )}
                                {o.paymentStatus === 'unpaid' && (
                                  <button onClick={(e) => { e.stopPropagation(); updateOrder(o.id, { paymentStatus: 'paid' }); }}
                                    disabled={updatingId === o.id}
                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                    Mark Paid (manual)
                                  </button>
                                )}
                                {o.status !== 'cancelled' && o.status !== 'delivered' && (
                                  <button onClick={(e) => { e.stopPropagation(); updateOrder(o.id, { status: 'cancelled' }); }}
                                    disabled={updatingId === o.id}
                                    className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                    Cancel
                                  </button>
                                )}
                                  {invoiceResult?.id === o.id && (
                                    <a href={invoiceResult.url} target="_blank" rel="noopener noreferrer"
                                      className="px-3 py-1.5 text-xs font-medium bg-white border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors">
                                      View Invoice →
                                    </a>
                                  )}
                                  <a href={`/print/order/${o.id}`} target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                    🖨 Proforma PDF
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

function Detail({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}: </span>
      <span className={`text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

export default function OrdersPage() {
  return <Suspense><OrdersContent /></Suspense>;
}
