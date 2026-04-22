import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { generateMagicToken, MAGIC_LINK_TTL_MINUTES } from '@/lib/portal-auth';
import { sendPortalMagicLink } from '@/lib/email';

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

      // Send magic link email using shared template
      await sendPortalMagicLink({ to: normalised, token, ttlMinutes: MAGIC_LINK_TTL_MINUTES });
    }

    // Always return the same response
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/portal/request-link:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
