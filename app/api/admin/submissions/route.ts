import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDistributorSubmissions, getContactSubmissions } from '@/lib/database';
import type { D1Database } from '@cloudflare/workers-types';

export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as Record<string, unknown>)['DB'] as D1Database | undefined;

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '15');
    const type = url.searchParams.get('type') || '';
    const search = url.searchParams.get('search') || '';

    let allSubmissions: unknown[] = [];
    let total = 0;

    if (!type || type === 'distributor') {
      const distributorResult = await getDistributorSubmissions(db, limit, offset, search);

      if (Array.isArray(distributorResult)) {
        allSubmissions.push(
          ...distributorResult.map((sub: Record<string, unknown>) => ({
            ...sub,
            type: 'distributor',
          }))
        );

        const countParams: unknown[] = [];
        let countQuery = 'SELECT COUNT(*) as count FROM distributor_submissions';
        if (search) {
          countQuery += ' WHERE email LIKE ?';
          countParams.push(`%${search}%`);
        }
        const countResult = await db.prepare(countQuery).bind(...countParams).all();
        total += ((countResult.results?.[0] as Record<string, unknown>)?.count as number) || 0;
      }
    }

    if (!type || type === 'contact') {
      const contactResult = await getContactSubmissions(db, limit, offset);

      if (contactResult.success && Array.isArray(contactResult.data)) {
        allSubmissions.push(
          ...contactResult.data.map((sub: Record<string, unknown>) => ({
            ...sub,
            type: 'contact',
            fullName: `${sub['firstName'] ?? ''} ${sub['lastName'] ?? ''}`.trim(),
          }))
        );

        const countResult = await db
          .prepare('SELECT COUNT(*) as count FROM contact_submissions')
          .all();
        total += ((countResult.results?.[0] as Record<string, unknown>)?.count as number) || 0;
      }
    }

    // Sort combined results by createdAt descending
    allSubmissions.sort((a, b) => {
      const aDate = String((a as Record<string, unknown>)['createdAt'] ?? '');
      const bDate = String((b as Record<string, unknown>)['createdAt'] ?? '');
      return bDate.localeCompare(aDate);
    });

    return NextResponse.json({
      submissions: allSubmissions,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
