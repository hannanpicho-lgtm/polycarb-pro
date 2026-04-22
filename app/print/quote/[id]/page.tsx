import { notFound } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { formatPrice, type Currency } from '@/lib/pricing';

interface QuoteRow {
  id: string; referenceId: string;
  customerName: string; customerEmail: string; customerCompany?: string;
  currency: string; status: string; message?: string; adminNotes?: string;
  quotedAmount?: number; products: string;
  submittedAt?: string; respondedAt?: string; createdAt: string;
}

interface QuoteItem {
  productName: string; qty: number; unit: string; unitPrice: number; lineTotal: number;
}

async function getQuote(id: string): Promise<QuoteRow | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as Record<string, unknown>)['DB'] as D1Database | undefined;
    if (!db) return null;
    return await db.prepare(`SELECT * FROM quotes WHERE id = ? OR referenceId = ?`)
      .bind(id, id).first<QuoteRow>();
  } catch { return null; }
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function PrintQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const currency = (quote.currency ?? 'USD') as Currency;
  let items: QuoteItem[] = [];
  try { items = JSON.parse(quote.products ?? '[]'); } catch { items = []; }

  const subtotal = items.reduce((s, i) => s + (i.lineTotal ?? 0), 0);
  const validUntil = new Date(quote.createdAt);
  validUntil.setDate(validUntil.getDate() + 30);

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
              {/* Logo wordmark */}
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
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0087C3', letterSpacing: -0.5 }}>QUOTATION</div>
              <table style={{ marginLeft: 'auto', marginTop: 8, fontSize: 12, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Reference</td><td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{quote.referenceId}</td></tr>
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Date</td><td>{fmtDate(quote.createdAt)}</td></tr>
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8', paddingBottom: 4 }}>Valid until</td><td>{fmtDate(validUntil.toISOString())}</td></tr>
                  <tr><td style={{ paddingRight: 16, color: '#94a3b8' }}>Currency</td><td>{currency}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bill to */}
      <div style={{ marginBottom: 28, padding: '14px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #0087C3' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 6 }}>Prepared for</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{quote.customerName}</div>
        {quote.customerCompany && <div style={{ fontSize: 13, color: '#475569' }}>{quote.customerCompany}</div>}
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{quote.customerEmail}</div>
      </div>

      {/* Line items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#fff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 80 }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 80 }}>Unit</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 110 }}>Unit Price</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: 110 }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '20px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No line items — this was a free-text quote request.
              </td>
            </tr>
          ) : items.map((item, i) => (
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
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, fontSize: 14, borderTop: '2px solid #0f172a' }}>
              {quote.quotedAmount ? 'Quoted Total' : 'Estimated Total'}
            </td>
            <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 900, fontSize: 16, color: '#0087C3', borderTop: '2px solid #0f172a', fontFamily: 'monospace' }}>
              {formatPrice(quote.quotedAmount ?? subtotal, currency)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Notes */}
      {(quote.message || quote.adminNotes) && (
        <div style={{ marginBottom: 24, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
          {quote.adminNotes && (
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: '#0f172a' }}>Notes from Covestro Polycarbonates:</strong><br />
              {quote.adminNotes}
            </div>
          )}
          {quote.message && !quote.adminNotes && (
            <div>
              <strong style={{ color: '#0f172a' }}>Request details:</strong><br />
              {quote.message}
            </div>
          )}
        </div>
      )}

      {/* Terms */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 8 }}>
        <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.7 }}>
          <strong style={{ color: '#64748b', display: 'block', marginBottom: 4 }}>Terms & Conditions</strong>
          Prices are indicative and subject to confirmation. This quotation is valid for 30 days from the date of issue.
          All prices are exclusive of taxes unless stated. Payment terms: 30 days net from invoice date.
          Minimum order quantities apply as specified per product. Lead times are estimates and may vary.
          For questions contact orders@covestroppc.com.
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, borderTop: '2px solid #0087C3', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
        <span>Covestro Polycarbonates · covestroppc.com</span>
        <span>Document: {quote.referenceId} · Generated {fmtDate(new Date().toISOString())}</span>
      </div>
    </div>
  );
}
