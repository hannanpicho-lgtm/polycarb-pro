import { NextRequest, NextResponse } from 'next/server';
import { getDistributorSubmissions, getContactSubmissions, getSubmissionStats } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Access D1 database
    const env = process.env as any;
    if (!env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // Handle stats action
    if (action === 'stats') {
      const stats = await getSubmissionStats(env.DB);
      return NextResponse.json({
        stats: {
          distributorCount: stats.distributorSubmissions,
          contactCount: stats.contactSubmissions,
          totalCount: stats.totalSubmissions,
        },
      });
    }

    // Handle submissions listing
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const type = url.searchParams.get('type') || '';
    const search = url.searchParams.get('search') || '';

    // Use pagination if page/pageSize are provided, otherwise use offset/limit
    const finalOffset = page > 1 ? (page - 1) * pageSize : offset;
    const finalLimit = pageSize > 0 ? pageSize : limit;

    let allSubmissions: any[] = [];
    let total = 0;

    if (!type || type === 'distributor') {
      const distributorResult = await getDistributorSubmissions(
        env.DB,
        finalLimit,
        finalOffset,
        search
      );

      if (Array.isArray(distributorResult)) {
        allSubmissions.push(
          ...distributorResult.map((sub: any) => ({
            ...sub,
            type: 'distributor',
            fullName: sub.fullName,
            company: sub.companyName,
          }))
        );
      }

      // Get total count
      let countQuery = 'SELECT COUNT(*) as count FROM distributor_submissions';
      const countParams: any[] = [];
      if (search) {
        countQuery += ' WHERE email LIKE ?';
        countParams.push(`%${search}%`);
      }
      const countResult = await env.DB.prepare(countQuery).bind(...countParams).all();
      total = (countResult.results?.[0] as any)?.count || 0;
    }

    if (!type || type === 'contact') {
      const contactResult = await getContactSubmissions(env.DB, finalLimit, finalOffset);

      if (contactResult.success && Array.isArray(contactResult.data)) {
        allSubmissions.push(
          ...contactResult.data.map((sub: any) => ({
            ...sub,
            type: 'contact',
            fullName: `${sub.firstName} ${sub.lastName}`,
          }))
        );
      }

      if (!type) {
        // Get total count for contact submissions
        const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM contact_submissions').all();
        total += (countResult.results?.[0] as any)?.count || 0;
      }
    }

    return NextResponse.json({
      submissions: allSubmissions,
      total,
      page: page > 0 ? page : Math.floor(finalOffset / finalLimit) + 1,
      pageSize: finalLimit,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
