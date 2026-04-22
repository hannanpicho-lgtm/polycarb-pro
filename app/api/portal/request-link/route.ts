import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { generateMagicToken, MAGIC_LINK_TTL_MINUTES } from '@/lib/portal-auth';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string };
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

    // Check email exists in orders, quotes, customers, or distributor submissions
    const [orderHit, customerHit, distributorHit] = await Promise.all([
      db.prepare('SELECT 1 FROM orders WHERE customerEmail = ? LIMIT 1').bind(normalised).first(),
      db.prepare('SELECT 1 FROM customers WHERE email = ? LIMIT 1').bind(normalised).first(),
      db.prepare('SELECT 1 FROM distributor_submissions WHERE email = ? LIMIT 1').bind(normalised).first(),
    ]);

    // Always return success to prevent email enumeration; only send if known
    const isKnown = !!(orderHit || customerHit || distributorHit);

    if (isKnown) {
      const token = await generateMagicToken();
      const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000).toISOString();
      const id = crypto.randomUUID();

      await db.prepare(
        `INSERT INTO magic_links (id, email, token, expiresAt) VALUES (?, ?, ?, ?)`
      ).bind(id, normalised, token, expiresAt).run();

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com';
      const link = `${siteUrl}/portal/verify?token=${token}`;

      // Send via Resend
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL ?? 'noreply@covestroppc.com',
            to: normalised,
            subject: 'Your Covestro PC portal login link',
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
                <img src="${siteUrl}/pictures/logo.png" alt="Covestro PC" style="height:40px;margin-bottom:24px" onerror="this.style.display='none'" />
                <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">Sign in to your portal</h1>
                <p style="color:#475569;font-size:15px;margin:0 0 24px">Click the button below to access your orders and quotes. The link expires in ${MAGIC_LINK_TTL_MINUTES} minutes.</p>
                <a href="${link}" style="display:inline-block;background:#0087C3;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">Open my portal →</a>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
                <p style="color:#cbd5e1;font-size:11px;margin-top:8px">${link}</p>
              </div>
            `,
          }),
        });
      }
    }

    // Always return the same response
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/portal/request-link:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
