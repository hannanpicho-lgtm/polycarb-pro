import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(','));
  }
  return lines.join('\r\n');
}

/**
 * GET /api/admin/export?type=orders|quotes|customers&from=YYYY-MM-DD&to=YYYY-MM-DD&status=
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? 'orders';
  const from = url.searchParams.get('from') ?? '';
  const to = url.searchParams.get('to') ?? '';
  const status = url.searchParams.get('status') ?? '';

  const db = await getD1();
  if (!db) return apiJsonError('Database unavailable', 503);

  const dateClause = (col: string) => {
    const parts: string[] = [];
    if (from) parts.push(`${col} >= '${from}'`);
    if (to) parts.push(`${col} <= '${to}T23:59:59'`);
    return parts.join(' AND ');
  };

  let csv = '';
  let filename = '';

  if (type === 'orders') {
    const conds: string[] = [];
    if (status) conds.push(`o.status = '${status}'`);
    const dc = dateClause('o.createdAt');
    if (dc) conds.push(dc);
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const result = await db
      .prepare(
        `SELECT o.referenceId, o.customerName, o.customerEmail, o.customerCompany,
              o.currency, o.status, o.paymentStatus,
              o.subtotal, o.shippingCost, o.total,
              o.shippingRegion, o.trackingNumber, o.adminNotes,
              o.confirmedAt, o.shippedAt, o.deliveredAt, o.createdAt,
              GROUP_CONCAT(i.productName || ' x' || i.qty || i.unit, ' | ') as items
       FROM orders o
       LEFT JOIN order_items i ON i.orderId = o.id
       ${where}
       GROUP BY o.id
       ORDER BY o.createdAt DESC`
      )
      .all();

    const headers = [
      'Reference',
      'Customer',
      'Email',
      'Company',
      'Currency',
      'Status',
      'Payment',
      'Subtotal',
      'Shipping',
      'Total',
      'Region',
      'Tracking',
      'Notes',
      'Confirmed',
      'Shipped',
      'Delivered',
      'Created',
      'Items',
    ];
    const rows = (result.results ?? []).map((r: unknown) => {
      const row = r as Record<string, unknown>;
      return [
        row.referenceId,
        row.customerName,
        row.customerEmail,
        row.customerCompany,
        row.currency,
        row.status,
        row.paymentStatus,
        row.subtotal,
        row.shippingCost,
        row.total,
        row.shippingRegion,
        row.trackingNumber,
        row.adminNotes,
        row.confirmedAt,
        row.shippedAt,
        row.deliveredAt,
        row.createdAt,
        row.items,
      ];
    });
    csv = toCSV(headers, rows);
    filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === 'quotes') {
    const conds: string[] = [];
    if (status) conds.push(`status = '${status}'`);
    const dc = dateClause('createdAt');
    if (dc) conds.push(dc);
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const result = await db
      .prepare(
        `SELECT referenceId, customerName, customerEmail, customerCompany,
              currency, status, source, message, adminNotes, quotedAmount,
              submittedAt, respondedAt, createdAt
       FROM quotes ${where} ORDER BY createdAt DESC`
      )
      .all();

    const headers = [
      'Reference',
      'Customer',
      'Email',
      'Company',
      'Currency',
      'Status',
      'Source',
      'Message',
      'Admin Notes',
      'Quoted Amount',
      'Submitted',
      'Responded',
      'Created',
    ];
    const rows = (result.results ?? []).map((r: unknown) => {
      const row = r as Record<string, unknown>;
      return [
        row.referenceId,
        row.customerName,
        row.customerEmail,
        row.customerCompany,
        row.currency,
        row.status,
        row.source,
        row.message,
        row.adminNotes,
        row.quotedAmount,
        row.submittedAt,
        row.respondedAt,
        row.createdAt,
      ];
    });
    csv = toCSV(headers, rows);
    filename = `quotes-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === 'customers') {
    const dc = dateClause('createdAt');
    const where = dc ? `WHERE ${dc}` : '';
    const result = await db
      .prepare(
        `SELECT firstName, lastName, email, company, phone, region, currency, notes, createdAt
       FROM customers ${where} ORDER BY createdAt DESC`
      )
      .all();

    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Company',
      'Phone',
      'Region',
      'Currency',
      'Notes',
      'Created',
    ];
    const rows = (result.results ?? []).map((r: unknown) => {
      const row = r as Record<string, unknown>;
      return [
        row.firstName,
        row.lastName,
        row.email,
        row.company,
        row.phone,
        row.region,
        row.currency,
        row.notes,
        row.createdAt,
      ];
    });
    csv = toCSV(headers, rows);
    filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === 'distributors') {
    const result = await db
      .prepare(
        `SELECT fullName, email, companyName, country, status, discountTier,
              approvedAt, rejectedAt, createdAt
       FROM distributor_submissions ORDER BY createdAt DESC`
      )
      .all();

    const headers = [
      'Name',
      'Email',
      'Company',
      'Country',
      'Status',
      'Tier',
      'Approved',
      'Rejected',
      'Applied',
    ];
    const rows = (result.results ?? []).map((r: unknown) => {
      const row = r as Record<string, unknown>;
      return [
        row.fullName,
        row.email,
        row.companyName,
        row.country,
        row.status,
        row.discountTier,
        row.approvedAt,
        row.rejectedAt,
        row.createdAt,
      ];
    });
    csv = toCSV(headers, rows);
    filename = `distributors-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    return apiJsonError('Invalid type', 400);
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
