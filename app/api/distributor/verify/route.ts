import { NextRequest, NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';
import { buildDistSessionCookie, DIST_COOKIE, DIST_COOKIE_MAX_AGE } from '@/lib/distributor-auth';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token)
    return NextResponse.redirect(new URL('/distributor?error=missing_token', request.url));

  const db = await getD1();
  if (!db) return NextResponse.redirect(new URL('/distributor?error=service', request.url));

  try {
    const row = await db
      .prepare(`SELECT id, email, expiresAt, usedAt FROM magic_links WHERE token = ? LIMIT 1`)
      .bind(token)
      .first<{ id: string; email: string; expiresAt: string; usedAt: string | null }>();

    if (!row) return NextResponse.redirect(new URL('/distributor?error=invalid', request.url));
    if (row.usedAt) return NextResponse.redirect(new URL('/distributor?error=used', request.url));
    if (new Date(row.expiresAt) < new Date())
      return NextResponse.redirect(new URL('/distributor?error=expired', request.url));

    // Verify email is a known distributor
    const dist = await db
      .prepare(
        `SELECT status FROM distributor_submissions WHERE email = ? ORDER BY createdAt DESC LIMIT 1`
      )
      .bind(row.email)
      .first<{ status: string }>();

    if (!dist) return NextResponse.redirect(new URL('/distributor?error=not_found', request.url));

    await db
      .prepare(`UPDATE magic_links SET usedAt = ? WHERE id = ?`)
      .bind(new Date().toISOString(), row.id)
      .run();

    const cookieValue = await buildDistSessionCookie(row.email);
    const response = NextResponse.redirect(new URL('/distributor/dashboard', request.url));
    response.cookies.set(DIST_COOKIE, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: DIST_COOKIE_MAX_AGE,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('GET /api/distributor/verify:', error);
    return NextResponse.redirect(new URL('/distributor?error=service', request.url));
  }
}
