import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import type { D1Database } from '@cloudflare/workers-types';

type WalletRow = { address: string };
type OrderRow = {
  id: string;
  referenceId: string;
  customerEmail: string;
  total: number;
  currency: string;
  paymentStatus: string;
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
    // Optional future table; fall back to env config if unavailable.
  }
  return process.env.USDT_TRC20_WALLET_ADDRESS?.trim() ?? null;
}

function parseAmountCrypto(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return NaN;
  return Math.round(parsed * 1_000_000) / 1_000_000;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const orderId = request.nextUrl.searchParams.get('orderId')?.trim();
    if (!orderId) return apiJsonError('orderId required', 400);

    const order = await db
      .prepare(
        `SELECT id, referenceId, customerEmail, total, currency, paymentStatus
         FROM orders WHERE id = ?`
      )
      .bind(orderId)
      .first<OrderRow>();
    if (!order) return apiJsonError('Order not found', 404);

    const walletAddress = await resolveTrc20Wallet(db);
    if (!walletAddress) return apiJsonError('Crypto wallet not configured', 503);

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        referenceId: order.referenceId,
        customerEmail: order.customerEmail,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
      },
      payment: {
        network: 'TRC20',
        token: 'USDT',
        walletAddress,
      },
    });
  } catch (error) {
    console.error('GET /api/crypto/submit failed', error);
    return apiJsonError('Failed to load crypto payment instructions', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const body = (await request.json()) as {
      orderId?: string;
      customerEmail?: string;
      network?: string;
      txHash?: string;
      walletFrom?: string;
      amountCrypto?: number | string;
      proofUrl?: string;
    };

    const orderId = body.orderId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase();
    const txHash = body.txHash?.trim();
    const network = (body.network?.trim().toUpperCase() || 'TRC20') as 'TRC20';
    const walletFrom = body.walletFrom?.trim() || null;
    const proofUrl = body.proofUrl?.trim() || null;
    const amountCrypto = parseAmountCrypto(body.amountCrypto);

    if (!orderId || !customerEmail || !txHash) {
      return apiJsonError('orderId, customerEmail, and txHash are required', 400);
    }
    if (network !== 'TRC20') {
      return apiJsonError('Only USDT TRC20 is supported in this release', 400);
    }
    if (Number.isNaN(amountCrypto)) {
      return apiJsonError('amountCrypto must be a positive number when provided', 400);
    }

    const order = await db
      .prepare(
        `SELECT id, customerEmail, paymentStatus
         FROM orders WHERE id = ?`
      )
      .bind(orderId)
      .first<{ id: string; customerEmail: string; paymentStatus: string }>();
    if (!order) return apiJsonError('Order not found', 404);
    if (order.customerEmail.trim().toLowerCase() !== customerEmail) {
      return apiJsonError('Email does not match this order', 403);
    }
    if (order.paymentStatus === 'paid') {
      return apiJsonError('Order is already marked paid', 409);
    }

    const now = new Date().toISOString();
    const submissionId = crypto.randomUUID();
    try {
      await db
        .prepare(
          `INSERT INTO crypto_payment_submissions
           (id, orderId, network, txHash, walletFrom, amountCrypto, proofUrl, status, submittedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
        )
        .bind(submissionId, orderId, network, txHash, walletFrom, amountCrypto, proofUrl, now)
        .run();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('UNIQUE') || msg.includes('constraint')) {
        return apiJsonError('This transaction hash has already been submitted', 409);
      }
      throw error;
    }

    // Preserve existing semantics: unpaid -> partial when payment processing starts.
    await db
      .prepare(
        `UPDATE orders SET paymentStatus = 'partial', updatedAt = ? WHERE id = ? AND paymentStatus = 'unpaid'`
      )
      .bind(now, orderId)
      .run();

    return NextResponse.json({ ok: true, submissionId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/crypto/submit failed', error);
    return apiJsonError('Failed to submit crypto payment proof', 500);
  }
}
