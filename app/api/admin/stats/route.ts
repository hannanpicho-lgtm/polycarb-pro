import { NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

export async function GET() {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database not available', 503);

    const [
      ordersByStatus,
      quotesByStatus,
      submissionCounts,
      distByStatus,
      revenueResult,
      recentOrders,
      recentQuotes,
      recentDist,
      pendingDistQuotes,
    ] = await Promise.all([
      db.prepare(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`).all(),
      db.prepare(`SELECT status, COUNT(*) as count FROM quotes GROUP BY status`).all(),
      db
        .prepare(
          `SELECT
          (SELECT COUNT(*) FROM distributor_submissions) as totalDist,
          (SELECT COUNT(*) FROM contact_submissions) as totalContact
        `
        )
        .first<{ totalDist: number; totalContact: number }>(),
      db
        .prepare(`SELECT status, COUNT(*) as count FROM distributor_submissions GROUP BY status`)
        .all(),
      db
        .prepare(
          `SELECT
          SUM(total) as totalRevenue,
          SUM(CASE WHEN paymentStatus='paid' THEN total ELSE 0 END) as paidRevenue,
          SUM(CASE WHEN paymentStatus='unpaid' THEN total ELSE 0 END) as unpaidRevenue,
          SUM(CASE WHEN paymentStatus='partial' THEN total ELSE 0 END) as partialRevenue,
          COUNT(*) as totalOrders
        FROM orders`
        )
        .first<{
          totalRevenue: number;
          paidRevenue: number;
          unpaidRevenue: number;
          partialRevenue: number;
          totalOrders: number;
        }>(),
      db
        .prepare(
          `SELECT id, referenceId, customerName, customerCompany, total, currency, status, paymentStatus, createdAt
        FROM orders ORDER BY createdAt DESC LIMIT 6`
        )
        .all(),
      db
        .prepare(
          `SELECT id, referenceId, customerName, customerEmail, status, currency, createdAt
        FROM quotes ORDER BY createdAt DESC LIMIT 6`
        )
        .all(),
      db
        .prepare(
          `SELECT id, fullName, companyName, status, discountTier, createdAt
        FROM distributor_submissions ORDER BY createdAt DESC LIMIT 5`
        )
        .all(),
      db
        .prepare(`SELECT COUNT(*) as count FROM distributor_quotes WHERE status='pending'`)
        .first<{ count: number }>(),
    ]);

    // Shape order stats map
    const orderMap: Record<string, number> = {};
    (ordersByStatus.results ?? []).forEach((r: unknown) => {
      const row = r as { status: string; count: number };
      orderMap[row.status] = row.count;
    });

    // Shape quote stats map
    const quoteMap: Record<string, number> = {};
    (quotesByStatus.results ?? []).forEach((r: unknown) => {
      const row = r as { status: string; count: number };
      quoteMap[row.status] = row.count;
    });

    // Shape distributor stats map
    const distMap: Record<string, number> = {};
    (distByStatus.results ?? []).forEach((r: unknown) => {
      const row = r as { status: string; count: number };
      distMap[row.status] = row.count;
    });

    return NextResponse.json({
      // Legacy fields (keep for compatibility)
      distributorSubmissions: submissionCounts?.totalDist ?? 0,
      contactSubmissions: submissionCounts?.totalContact ?? 0,
      totalSubmissions: (submissionCounts?.totalDist ?? 0) + (submissionCounts?.totalContact ?? 0),

      // Revenue
      revenue: {
        total: revenueResult?.totalRevenue ?? 0,
        paid: revenueResult?.paidRevenue ?? 0,
        unpaid: revenueResult?.unpaidRevenue ?? 0,
        partial: revenueResult?.partialRevenue ?? 0,
        outstanding: (revenueResult?.unpaidRevenue ?? 0) + (revenueResult?.partialRevenue ?? 0),
      },

      // Orders
      orders: {
        total: revenueResult?.totalOrders ?? 0,
        byStatus: orderMap,
        needsAttention: orderMap['pending'] ?? 0,
        unpaid:
          (orderMap['pending'] ?? 0) + (orderMap['confirmed'] ?? 0) + (orderMap['processing'] ?? 0),
      },

      // Quotes
      quotes: {
        total: Object.values(quoteMap).reduce((s, v) => s + v, 0),
        byStatus: quoteMap,
        pending: quoteMap['pending'] ?? 0,
      },

      // Distributors
      distributors: {
        byStatus: distMap,
        pending: distMap['pending'] ?? 0,
        approved: distMap['approved'] ?? 0,
        distQuotesPending: pendingDistQuotes?.count ?? 0,
      },

      // Recent activity
      recent: {
        orders: recentOrders.results ?? [],
        quotes: recentQuotes.results ?? [],
        distributors: recentDist.results ?? [],
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return apiJsonError('Failed to fetch stats', 500);
  }
}
