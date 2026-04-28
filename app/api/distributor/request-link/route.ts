import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { generateMagicToken, MAGIC_LINK_TTL_MINUTES } from '@/lib/portal-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || !email.includes('@')) {
      return apiJsonError('Valid email required', 400);
    }

    const normalised = email.trim().toLowerCase();
    const db = await getD1();
    if (!db) return apiJsonError('Service unavailable', 503);

    // Only send to confirmed distributors (any status — they can see their pending status too)
    const distRow = await db
      .prepare(
        `SELECT status, discountTier FROM distributor_submissions WHERE email = ? ORDER BY createdAt DESC LIMIT 1`
      )
      .bind(normalised)
      .first<{ status: string; discountTier: string }>();

    // Always return success to prevent email enumeration
    if (distRow) {
      const token = await generateMagicToken();
      const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000).toISOString();
      const id = crypto.randomUUID();

      await db
        .prepare(`INSERT INTO magic_links (id, email, token, expiresAt) VALUES (?, ?, ?, ?)`)
        .bind(id, normalised, token, expiresAt)
        .run();

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com';
      const link = `${siteUrl}/distributor/verify?token=${token}`;

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const isApproved = distRow.status === 'approved';
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL ?? 'noreply@covestroppc.com',
            to: normalised,
            subject: isApproved
              ? 'Your Covestro PC Distributor Portal access'
              : 'Your Covestro PC distributor application status',
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px">
                <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">
                  ${isApproved ? 'Access your distributor portal' : 'Check your application status'}
                </h1>
                <p style="color:#475569;font-size:15px;margin:0 0 24px">
                  ${
                    isApproved
                      ? 'Click below to access your distributor dashboard — pricing, catalog, and order management.'
                      : 'Click below to check the current status of your distributor application.'
                  }
                </p>
                <a href="${link}" style="display:inline-block;background:#0087C3;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
                  Open portal →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                  Link expires in ${MAGIC_LINK_TTL_MINUTES} minutes. If you didn't request this, ignore this email.
                </p>
              </div>
            `,
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/distributor/request-link:', error);
    return apiJsonError('Failed', 500);
  }
}
