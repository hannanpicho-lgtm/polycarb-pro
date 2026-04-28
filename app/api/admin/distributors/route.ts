import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

/** PATCH — approve or reject a distributor application */
export async function PATCH(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const body = (await request.json()) as {
      id: string;
      action: 'approve' | 'reject' | 'review';
      discountTier?: string;
      internalNotes?: string;
      rejectionReason?: string;
    };

    if (!body.id || !body.action) {
      return apiJsonError('id and action required', 400);
    }

    const now = new Date().toISOString();

    if (body.action === 'approve') {
      await db
        .prepare(
          `UPDATE distributor_submissions
         SET status = 'approved', discountTier = COALESCE(?, discountTier),
             approvedAt = ?, internalNotes = COALESCE(?, internalNotes)
         WHERE id = ?`
        )
        .bind(body.discountTier ?? null, now, body.internalNotes ?? null, body.id)
        .run();

      // Fetch the distributor to send approval email
      const dist = await db
        .prepare(
          `SELECT fullName, email, companyName, discountTier FROM distributor_submissions WHERE id = ?`
        )
        .bind(body.id)
        .first<{ fullName: string; email: string; companyName: string; discountTier: string }>();

      if (dist) {
        const resendKey = process.env.RESEND_API_KEY;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com';
        if (resendKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: process.env.FROM_EMAIL ?? 'noreply@covestroppc.com',
              to: dist.email,
              subject: `Welcome to Covestro PC Distributor Network — Application Approved`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
                  <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px">
                    Congratulations, ${dist.fullName.split(' ')[0]}!
                  </h1>
                  <p style="color:#475569;font-size:15px;margin:0 0 16px">
                    Your distributor application for <strong>${dist.companyName}</strong> has been approved.
                    You've been enrolled as a <strong>${(dist.discountTier || 'bronze').charAt(0).toUpperCase() + (dist.discountTier || 'bronze').slice(1)} Distributor</strong>.
                  </p>
                  <p style="color:#475569;font-size:15px;margin:0 0 24px">
                    Access your portal to view your pricing, submit quotes, and track orders:
                  </p>
                  <a href="${siteUrl}/distributor" style="display:inline-block;background:#0087C3;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
                    Access Distributor Portal →
                  </a>
                  <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                    You'll receive a secure sign-in link when you enter your email on the portal page.
                  </p>
                </div>
              `,
            }),
          });
        }
      }
    } else if (body.action === 'reject') {
      await db
        .prepare(
          `UPDATE distributor_submissions
         SET status = 'rejected', rejectedAt = ?,
             rejectionReason = COALESCE(?, rejectionReason),
             internalNotes = COALESCE(?, internalNotes)
         WHERE id = ?`
        )
        .bind(now, body.rejectionReason ?? null, body.internalNotes ?? null, body.id)
        .run();
    } else if (body.action === 'review') {
      await db
        .prepare(
          `UPDATE distributor_submissions SET status = 'reviewed', internalNotes = COALESCE(?, internalNotes) WHERE id = ?`
        )
        .bind(body.internalNotes ?? null, body.id)
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/distributors:', error);
    return apiJsonError('Failed', 500);
  }
}

/** POST — update a distributor quote status and optionally notify the distributor */
export async function POST(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const body = (await request.json()) as {
      quoteId: string;
      status: 'reviewed' | 'quoted' | 'approved' | 'rejected';
      adminNotes?: string;
      notify?: boolean;
    };

    if (!body.quoteId || !body.status) {
      return apiJsonError('quoteId and status required', 400);
    }

    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE distributor_quotes SET status = ?, adminNotes = COALESCE(?, adminNotes), respondedAt = ?, updatedAt = ? WHERE id = ?`
      )
      .bind(body.status, body.adminNotes ?? null, now, now, body.quoteId)
      .run();

    // Optionally notify the distributor
    if (body.notify) {
      const quote = await db
        .prepare(
          `SELECT id, referenceId, distributorEmail, distributorCompany, subtotalNet, currency, status
         FROM distributor_quotes WHERE id = ?`
        )
        .bind(body.quoteId)
        .first<{
          id: string;
          referenceId: string;
          distributorEmail: string;
          distributorCompany: string;
          subtotalNet: number;
          currency: string;
          status: string;
        }>();

      if (quote) {
        const resendKey = process.env.RESEND_API_KEY;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com';
        if (resendKey) {
          const statusLabel: Record<string, string> = {
            reviewed: 'Under Review',
            quoted: 'Quote Ready',
            approved: 'Approved',
            rejected: 'Declined',
          };
          const statusColor: Record<string, string> = {
            reviewed: '#0087C3',
            quoted: '#7c3aed',
            approved: '#059669',
            rejected: '#dc2626',
          };
          const bodyText: Record<string, string> = {
            reviewed: `We've received your quote request <strong>${quote.referenceId}</strong> and our team is reviewing it. We'll be in touch shortly.`,
            quoted: `We've prepared a response to your quote request <strong>${quote.referenceId}</strong>. Log in to your portal to view the details.`,
            approved: `Your quote request <strong>${quote.referenceId}</strong> has been approved and is ready to proceed to order.`,
            rejected: `After review, we're unable to fulfill quote request <strong>${quote.referenceId}</strong> at this time. Please contact your account manager for alternatives.`,
          };
          const noteHtml = body.adminNotes
            ? `<div style="background:#f8fafc;border-left:3px solid #0087C3;padding:12px 14px;margin:16px 0;font-size:13px;color:#475569;font-style:italic">"${body.adminNotes}"</div>`
            : '';

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: process.env.FROM_EMAIL ?? 'noreply@covestroppc.com',
              to: quote.distributorEmail,
              subject: `Quote ${quote.referenceId} — ${statusLabel[body.status] ?? body.status}`,
              html: `<!DOCTYPE html><html><body style="margin:0;background:#f8fafc;font-family:system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="540" style="max-width:540px;width:100%">
  <tr><td style="background:${statusColor[body.status] ?? '#0087C3'};padding:24px 28px;border-radius:10px 10px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Covestro Polycarbonates — Distributor Portal</p>
    <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">Quote Update: ${quote.referenceId}</h1>
  </td></tr>
  <tr><td style="background:#fff;padding:28px;border-radius:0 0 10px 10px;border:1px solid #e2e8f0;border-top:none">
    <p style="margin:0 0 12px;font-size:14px;color:#374151">Hi ${quote.distributorCompany},</p>
    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6">${bodyText[body.status] ?? ''}</p>
    ${noteHtml}
    <a href="${siteUrl}/distributor/dashboard" style="display:inline-block;margin-top:20px;background:#0f172a;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:600;font-size:14px">
      View in Portal →
    </a>
    <p style="margin-top:24px;font-size:12px;color:#94a3b8">© 2026 Covestro Polycarbonates</p>
  </td></tr>
</table></td></tr></table>
</body></html>`,
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/admin/distributors:', error);
    return apiJsonError('Failed', 500);
  }
}

/** GET — list distributor quotes submitted via portal */
export async function GET(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('DB unavailable', 503);

    const url = new URL(request.url);
    const view = url.searchParams.get('view') || 'applications';
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (view === 'quotes') {
      const result = await db
        .prepare(`SELECT * FROM distributor_quotes ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
        .bind(limit, offset)
        .all();
      const countResult = await db
        .prepare('SELECT COUNT(*) as count FROM distributor_quotes')
        .all();
      return NextResponse.json({
        quotes: result.results ?? [],
        total: (countResult.results?.[0] as Record<string, unknown>)?.count ?? 0,
      });
    }

    return apiJsonError('Unknown view', 400);
  } catch (error) {
    console.error('GET /api/admin/distributors:', error);
    return apiJsonError('Failed', 500);
  }
}
