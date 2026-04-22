import { notFound } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { formatPrice, type Currency } from '@/lib/pricing';

interface OrderRow {
  id: string; referenceId: string;
  customerName: string; customerEmail: string; customerCompany?: string;
  currency: string; status: string; paymentStatus: string;
  subtotal: number; shippingCost: number; total: number;
  shippingRegion?: string; trackingNumber?: string; adminNotes?: string;
  confirmedAt?: string; shippedAt?: string; deliveredAt?: string; createdAt: string;
}
interface ItemRow { productName: string; productSlug: string; qty: number; unit: string; unitPrice: number; lineTotal: number }

async function getOrder(id: string): Promise<{ order: OrderRow; items: ItemRow[] } | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as Record<string, unknown>)['DB'] as D1Database | undefined;
    if (!db) return null;
    const [order, itemsResult] = await Promise.all([
      db.prepare(`SELECT * FROM orders WHERE id = ? OR referenceId = ?`).bind(id, id).first<OrderRow>(),
      db.prepare(`SELECT * FROM order_items WHERE orderId = (SELECT id FROM orders WHERE id = ? OR referenceId = ? LIMIT 1)`).bind(id, id).all<ItemRow>(),
    ]);
    if (!order) return null;
    return { order, items: itemsResult.results ?? [] };
  } catch { return null; }
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

const PAY_LABEL: Record<string, { label: string; color: string }> = {
  unpaid:   { label: 'PAYMENT PENDING', color: '#dc2626' },
  partial:  { label: 'PARTIALLY PAID',  color: '#d97706' },
  paid:     { label: 'PAID',            color: '#059669' },
  refunded: { label: 'REFUNDED',        color: '#64748b' },
};

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrder(id);
  if (!result) notFound();
  const { order, items } = result;
  const currency = (order.currency ?? 'USD') as Currency;
  const payInfo = PAY_LABEL[order.paymentStatus] ?? { label: order.paymentStatus.toUpperCase(), color: '#64748b' };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
      {/* Print button */}
      <div className="no-print" style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <button onClick={() => window.print()}
          style={{ padding: '8px 20px', background: '#0087C3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Print / Save as PDF
        </button>
        <button onClick={() => window.history.back()}
          style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
      </div>

      {/* Header */}
      <table style={{ width: '100%', marginBottom: 32 }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0087C3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>PC</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Covestro Polycarbonates</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>covestroppc.com</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                covestroppc.com<br />orders@covestroppc.com
              </div>
            </td>
            <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0087C3', letterSpacing: -0.5 }}>PROFORMA INVOICE</div>
              <div style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 4, background: payInfo.color, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
                {payInfo.label}
              </div>
              <table style={{ marginLeft: 'auto', marginTop: 8, fontSize: 12, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Order Ref</td><td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{order.referenceId}</td></tr>
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Order Date</td><td>{fmtDate(order.createdAt)}</td></tr>
                  {order.confirmedAt && <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Confirmed</td><td>{fmtDate(order.confirmedAt)}</td></tr>}
                  {order.shippedAt && <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Shipped</td><td>{fmtDate(order.shippedAt)}</td></tr>}
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8' }}>Currency</td><td>{currency}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bill to */}
      <table style={{ width: '100%', marginBottom: 28 }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', paddingRight: 16, verticalAlign: 'top' }}>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #0087C3' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 6 }}>Bill to</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{order.customerName}</div>
                {order.customerCompany && <div style={{ fontSize: 13, color: '#475569' }}>{order.customerCompany}</div>}
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{order.customerEmail}</div>
              </div>
            </td>
            <td style={{ width: '50%', verticalAlign: 'top' }}>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 6 }}>Shipping details</div>
                {order.shippingRegion && <div style={{ fontSize: 13, color: '#475569' }}>Region: {order.shippingRegion}</div>}
                {order.trackingNumber && <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Tracking: <strong>{order.trackingNumber}</strong></div>}
                {!order.shippingRegion && !order.trackingNumber && <div style={{ fontSize: 13, color: '#94a3b8' }}>To be confirmed</div>}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Line items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#fff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 70 }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 60 }}>Unit</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 110 }}>Unit Price</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 110 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ padding: '10px 12px', fontSize: 13, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{item.productName}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}>{item.qty}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}>{item.unit}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace' }}>
                {formatPrice(item.unitPrice, currency)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace' }}>
                {formatPrice(item.lineTotal, currency)}
              </td>
            </tr>
          ))}
          {/* Shipping row */}
          {order.shippingCost > 0 && (
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan={4} style={{ padding: '10px 12px', fontSize: 13, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                Shipping{order.shippingRegion ? ` — ${order.shippingRegion}` : ''}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace' }}>
                {formatPrice(order.shippingCost, currency)}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#64748b', borderTop: '1px solid #e2e8f0' }}>Subtotal</td>
            <td colSpan={2} style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace', borderTop: '1px solid #e2e8f0' }}>
              {formatPrice(order.subtotal, currency)}
            </td>
          </tr>
          {order.shippingCost > 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '4px 12px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>Shipping</td>
              <td colSpan={2} style={{ padding: '4px 12px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                {formatPrice(order.shippingCost, currency)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, fontSize: 14, borderTop: '2px solid #0f172a' }}>Total</td>
            <td colSpan={2} style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 900, fontSize: 18, color: '#0087C3', borderTop: '2px solid #0f172a', fontFamily: 'monospace' }}>
              {formatPrice(order.total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Notes */}
      {order.adminNotes && (
        <div style={{ marginBottom: 20, padding: '12px 14px', background: '#f0f9ff', borderRadius: 8, borderLeft: '3px solid #0ea5e9', fontSize: 12, color: '#0369a1' }}>
          <strong>Note:</strong> {order.adminNotes}
        </div>
      )}

      {/* Terms */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.7 }}>
          <strong style={{ color: '#64748b', display: 'block', marginBottom: 4 }}>Terms & Conditions</strong>
          This proforma invoice is issued for customs clearance and payment reference purposes.
          Payment is due within 30 days of the invoice date unless otherwise agreed.
          Goods remain the property of Covestro Polycarbonates until full payment is received.
          For queries contact orders@covestroppc.com.
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, borderTop: '2px solid #0087C3', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
        <span>Covestro Polycarbonates · covestroppc.com</span>
        <span>Document: {order.referenceId} · Generated {fmtDate(new Date().toISOString())}</span>
      </div>
    </div>
  );
}
