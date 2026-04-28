import { NextResponse } from 'next/server';

/**
 * Liveness: minimal body for load balancers and smoke checks.
 * Use `/api/version` when you need build metadata (commit, builtAt).
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, status: 'ok' },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
