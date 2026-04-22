import { NextResponse } from 'next/server';
import { buildInfo } from '@/lib/build-info';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      ...buildInfo,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

