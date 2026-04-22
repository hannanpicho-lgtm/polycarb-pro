import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { buildSessionCookie, PORTAL_COOKIE, PORTAL_COOKIE_MAX_AGE } from '@/lib/portal-auth';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/portal?error=missing_token', request.url));
  }

  const db = await getDB();
  if (!db) return NextResponse.redirect(new URL('/portal?error=service', request.url));

  try {
    const row = await db.prepare(
      `SELECT * FROM magic_links WHERE token = ? LIMIT 1`
    ).bind(token).first<{ id: string; email: string; expiresAt: string; usedAt: string | null }>();

    if (!row) return NextResponse.redirect(new URL('/portal?error=invalid', request.url));
    if (row.usedAt) return NextResponse.redirect(new URL('/portal?error=used', request.url));
    if (new Date(row.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL('/portal?error=expired', request.url));
    }

    // Mark token as used
    await db.prepare(
      `UPDATE magic_links SET usedAt = ? WHERE id = ?`
    ).bind(new Date().toISOString(), row.id).run();

    const cookieValue = await buildSessionCookie(row.email);

    const response = NextResponse.redirect(new URL('/portal/dashboard', request.url));
    response.cookies.set(PORTAL_COOKIE, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: PORTAL_COOKIE_MAX_AGE,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('GET /api/portal/verify:', error);
    return NextResponse.redirect(new URL('/portal?error=service', request.url));
  }
}
