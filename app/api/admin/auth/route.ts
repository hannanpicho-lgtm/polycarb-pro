import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { computeAdminToken, ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return apiJsonError('Admin not configured', 503);
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return apiJsonError('Invalid request', 400);
  }

  if (!body.password || body.password !== adminPassword) {
    await new Promise((r) => setTimeout(r, 600));
    return apiJsonError('Invalid password', 401);
  }

  const token = await computeAdminToken(adminPassword);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
