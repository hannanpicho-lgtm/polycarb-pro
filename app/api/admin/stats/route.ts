import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionStats } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Access D1 database
    const env = process.env as any;
    if (!env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const stats = await getSubmissionStats(env.DB);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
