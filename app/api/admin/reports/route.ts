import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET() {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const [
      monthlyOrders,
      orderStatusBreakdown,
      quoteStatusBreakdown,
      topProducts,
      distStats,
      paymentBreakdown,
      recentConversions,
    ] = await Promise.all([
      // Monthly orders + revenue for last 12 months
      db.prepare(`
        SELECT strftime('%Y-%m', createdAt) as month,
               COUNT(*) as orderCount,
               SUM(total) as revenue,
               SUM(CASE WHEN paymentStatus='paid' THEN total ELSE 0 END) as collected,
               SUM(CASE WHEN currency='AUD' THEN total ELSE 0 END) as revenueAUD,
               SUM(CASE WHEN currency='USD' THEN total ELSE 0 END) as revenueUSD
        FROM orders
        WHERE createdAt >= date('now', '-12 months')
        GROUP BY month
        ORDER BY month ASC
      `).all(),

      // Orders by status
      db.prepare(`SELECT status, COUNT(*) as count, SUM(total) as value FROM orders GROUP BY status`).all(),

      // Quotes by status + conversion rate
      db.prepare(`SELECT status, COUNT(*) as count FROM quotes GROUP BY status`).all(),

      // Top 10 products by revenue
      db.prepare(`
        SELECT productName, productSlug,
               SUM(qty) as totalQty,
               SUM(lineTotal) as totalRevenue,
               COUNT(DISTINCT orderId) as orderCount
        FROM order_items
        GROUP BY productSlug, productName
        ORDER BY totalRevenue DESC
        LIMIT 10
      `).all(),

      // Distributor stats
      db.prepare(`
        SELECT
          (SELECT COUNT(*) FROM distributor_submissions WHERE status='approved') as approved,
          (SELECT COUNT(*) FROM distributor_submissions WHERE status='pending') as pending,
          (SELECT COUNT(*) FROM distributor_quotes) as quotesSubmitted,
          (SELECT COUNT(*) FROM distributor_quotes WHERE status='ordered') as quotesConverted,
          (SELECT SUM(subtotalNet) FROM distributor_quotes WHERE status='ordered') as distRevenue
      `).first<{
        approved: number; pending: number;
        quotesSubmitted: number; quotesConverted: number; distRevenue: number;
      }>(),

      // Payment status breakdown
      db.prepare(`
        SELECT paymentStatus,
               COUNT(*) as count,
               SUM(total) as value
        FROM orders GROUP BY paymentStatus
      `).all(),

      // Quote → order conversion (quotes that became orders)
      db.prepare(`
        SELECT COUNT(*) as converted
        FROM quotes
        WHERE status IN ('converted', 'accepted', 'ordered')
      `).first<{ converted: number }>(),
    ]);

    // Fill in missing months with zero values
    const monthMap: Record<string, { month: string; orderCount: number; revenue: number; collected: number }> = {};
    (monthlyOrders.results ?? []).forEach((r: unknown) => {
      const row = r as { month: string; orderCount: number; revenue: number; collected: number };
      monthMap[row.month] = row;
    });

    // Generate last 12 month labels
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
    }
    const monthlyData = months.map(m => monthMap[m] ?? { month: m, orderCount: 0, revenue: 0, collected: 0 });

    // Quote totals
    const quoteMap: Record<string, number> = {};
    (quoteStatusBreakdown.results ?? []).forEach((r: unknown) => {
      const row = r as { status: string; count: number };
      quoteMap[row.status] = row.count;
    });
    const totalQuotes = Object.values(quoteMap).reduce((s, v) => s + v, 0);
    const convertedQuotes = recentConversions?.converted ?? 0;
    const conversionRate = totalQuotes > 0 ? Math.round((convertedQuotes / totalQuotes) * 100) : 0;

    return NextResponse.json({
      monthly: monthlyData,
      ordersByStatus: orderStatusBreakdown.results ?? [],
      quotesByStatus: quoteStatusBreakdown.results ?? [],
      quoteConversionRate: conversionRate,
      totalQuotes,
      convertedQuotes,
      topProducts: topProducts.results ?? [],
      distributors: distStats ?? { approved: 0, pending: 0, quotesSubmitted: 0, quotesConverted: 0, distRevenue: 0 },
      paymentBreakdown: paymentBreakdown.results ?? [],
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
