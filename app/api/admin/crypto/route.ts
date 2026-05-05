import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { sendCryptoPaymentInstructions, sendCryptoPaymentVerifiedEmail } from '@/lib/email';
import type { D1Database } from '@cloudflare/workers-types';

type WalletRow = { address: string };
type OrderRow = {
  id: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  paymentStatus: string;
};

type SubmissionRow = {
  id: string;
  orderId: string;
  network: string;
  txHash: string;
  walletFrom: string | null;
  amountCrypto: number | null;
  proofUrl: string | null;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
};

async function resolveTrc20Wallet(db: D1Database): Promise<string | null> {
  try {
    const row = await db
      .prepare(
        `SELECT address
         FROM payment_wallet_settings
         WHERE network = 'TRC20' AND isActive = 1
         ORDER BY updatedAt DESC
         LIMIT 1`
      )
      .first<WalletRow>();
    if (row?.address?.trim()) return row.address.trim();
  } catch {
    // DB is now the primary source; env is a last-resort bootstrap fallback.
  }
  return process.env.USDT_TRC20_WALLET_ADDRESS?.trim() ?? null;
}

function adminActorId(request: NextRequest): string {
  const hinted = request.headers.get('x-admin-id')?.trim();
  if (hinted) return hinted;
  return process.env.ADMIN_NOTIFY_EMAIL ?? 'admin';
}

async function writeVerificationLog(
  db: D1Database,
  input: {
    submissionId: string;
    action: 'verified' | 'rejected';
    adminId: string;
    note?: string;
  }
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO crypto_verification_logs
       (id, submissionId, action, adminId, timestamp, note)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      crypto.randomUUID(),
      input.submissionId,
      input.action,
      input.adminId,
      now,
      input.note ?? null
    )
    .run();
}

export async function GET(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const orderId = request.nextUrl.searchParams.get('orderId')?.trim();
    if (!orderId) return apiJsonError('orderId required', 400);

    const submissions = await db
      .prepare(
        `SELECT id, orderId, network, txHash, walletFrom, amountCrypto, proofUrl,
                status, submittedAt, reviewedAt, reviewedBy, rejectionReason, adminNotes
         FROM crypto_payment_submissions
         WHERE orderId = ?
         ORDER BY submittedAt DESC`
      )
      .bind(orderId)
      .all<SubmissionRow>();

    const walletAddress = await resolveTrc20Wallet(db);
    return NextResponse.json({
      ok: true,
      walletAddress,
      submissions: submissions.results ?? [],
    });
  } catch (error) {
    console.error('GET /api/admin/crypto failed', error);
    return apiJsonError('Failed to load crypto submissions', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const body = (await request.json()) as {
      action?: 'request_instructions';
      orderId?: string;
    };
    if (body.action !== 'request_instructions') {
      return apiJsonError('Unsupported action', 400);
    }
    const orderId = body.orderId?.trim();
    if (!orderId) return apiJsonError('orderId required', 400);

    const order = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerEmail, total, currency, paymentStatus
         FROM orders WHERE id = ?`
      )
      .bind(orderId)
      .first<OrderRow>();
    if (!order) return apiJsonError('Order not found', 404);

    const walletAddress = await resolveTrc20Wallet(db);
    if (!walletAddress) return apiJsonError('Crypto wallet not configured', 503);

    const payUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com'}/pay/${order.id}/crypto`;
    const sendResult = await sendCryptoPaymentInstructions({
      to: order.customerEmail,
      customerName: order.customerName,
      referenceId: order.referenceId,
      amountFiat: order.total,
      currency: order.currency,
      token: 'USDT',
      network: 'TRC20',
      walletAddress,
      payUrl,
    });
    if (!sendResult.ok) {
      return apiJsonError('Failed to send crypto instructions email', 502, {
        detail: sendResult.error,
      });
    }

    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE orders SET paymentStatus = 'partial', updatedAt = ? WHERE id = ? AND paymentStatus = 'unpaid'`
      )
      .bind(now, order.id)
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/admin/crypto failed', error);
    return apiJsonError('Failed to request crypto payment', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const body = (await request.json()) as {
      submissionId?: string;
      action?: 'verify' | 'reject';
      adminNote?: string;
      rejectionReason?: string;
      confirmUnderpaid?: boolean;
    };
    const submissionId = body.submissionId?.trim();
    if (!submissionId || !body.action) {
      return apiJsonError('submissionId and action are required', 400);
    }

    const submission = await db
      .prepare(
        `SELECT id, orderId, network, txHash, walletFrom, amountCrypto, proofUrl,
                status, submittedAt, reviewedAt, reviewedBy, rejectionReason, adminNotes
         FROM crypto_payment_submissions
         WHERE id = ?`
      )
      .bind(submissionId)
      .first<SubmissionRow>();
    if (!submission) return apiJsonError('Submission not found', 404);
    if (submission.status !== 'pending') return apiJsonError('Submission is already reviewed', 409);

    const order = await db
      .prepare(
        `SELECT id, referenceId, customerName, customerEmail, total, currency, paymentStatus
         FROM orders WHERE id = ?`
      )
      .bind(submission.orderId)
      .first<OrderRow>();
    if (!order) return apiJsonError('Order not found', 404);
    if (body.action === 'verify' && order.paymentStatus === 'paid') {
      return apiJsonError('Order is already marked paid', 409);
    }

    const now = new Date().toISOString();
    const actor = adminActorId(request);

    if (body.action === 'reject') {
      await db
        .prepare(
          `UPDATE crypto_payment_submissions
           SET status = 'rejected',
               reviewedAt = ?,
               reviewedBy = ?,
               rejectionReason = ?,
               adminNotes = ?
           WHERE id = ?`
        )
        .bind(
          now,
          actor,
          body.rejectionReason?.trim() || 'Rejected by admin',
          body.adminNote ?? null,
          submission.id
        )
        .run();

      await writeVerificationLog(db, {
        submissionId: submission.id,
        action: 'rejected',
        adminId: actor,
        note: body.adminNote ?? body.rejectionReason ?? undefined,
      });

      return NextResponse.json({ ok: true, status: 'rejected' });
    }

    if (
      submission.amountCrypto !== null &&
      Number.isFinite(submission.amountCrypto) &&
      submission.amountCrypto < order.total &&
      !body.confirmUnderpaid
    ) {
      return NextResponse.json(
        {
          error: 'Submitted crypto amount is lower than order total',
          requiresUnderpaidConfirmation: true,
          submittedAmountCrypto: submission.amountCrypto,
          orderTotal: order.total,
          currency: order.currency,
        },
        { status: 409 }
      );
    }

    const amountToRecord =
      submission.amountCrypto !== null && Number.isFinite(submission.amountCrypto)
        ? submission.amountCrypto
        : order.total;

    await db
      .prepare(
        `INSERT INTO payments
         (id, orderId, amount, currency, method, status, paidAt, notes,
          cryptoTxHash, cryptoNetwork, cryptoWalletFrom, cryptoProofUrl, createdAt)
         VALUES (?, ?, ?, ?, ?, 'succeeded', ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        crypto.randomUUID(),
        order.id,
        amountToRecord,
        order.currency,
        'crypto_usdt_trc20',
        now,
        body.adminNote ?? null,
        submission.txHash,
        submission.network,
        submission.walletFrom,
        submission.proofUrl,
        now
      )
      .run();

    await db
      .prepare(`UPDATE orders SET paymentStatus = 'paid', updatedAt = ? WHERE id = ?`)
      .bind(now, order.id)
      .run();

    await db
      .prepare(
        `UPDATE crypto_payment_submissions
         SET status = 'verified',
             reviewedAt = ?,
             reviewedBy = ?,
             adminNotes = ?
         WHERE id = ?`
      )
      .bind(now, actor, body.adminNote ?? null, submission.id)
      .run();

    await writeVerificationLog(db, {
      submissionId: submission.id,
      action: 'verified',
      adminId: actor,
      note: body.adminNote ?? undefined,
    });

    await sendCryptoPaymentVerifiedEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      referenceId: order.referenceId,
      txHash: submission.txHash,
      network: submission.network,
    });

    return NextResponse.json({ ok: true, status: 'verified' });
  } catch (error) {
    console.error('PATCH /api/admin/crypto failed', error);
    return apiJsonError('Failed to review crypto submission', 500);
  }
}
