import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import type { D1Database } from '@cloudflare/workers-types';

// Accepted network keys (must match payment_wallet_settings.network values)
const SUPPORTED_NETWORKS = ['TRC20', 'ETH', 'USDC', 'BTC'] as const;
type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

// Human-readable token label per network, used in customer-facing responses
const NETWORK_TOKEN: Record<SupportedNetwork, string> = {
  TRC20: 'USDT',
  ETH: 'ETH',
  USDC: 'USDC',
  BTC: 'BTC',
};

type ActiveWalletRow = { network: string; address: string };
type OrderRow = {
  id: string;
  referenceId: string;
  customerEmail: string;
  total: number;
  currency: string;
  paymentStatus: string;
};

async function resolveActiveWallets(
  db: D1Database
): Promise<Array<{ network: SupportedNetwork; token: string; walletAddress: string }>> {
  const wallets: Array<{ network: SupportedNetwork; token: string; walletAddress: string }> = [];
  try {
    const rows = await db
      .prepare(
        `SELECT network, address
         FROM payment_wallet_settings
         WHERE isActive = 1
         ORDER BY updatedAt DESC`
      )
      .all<ActiveWalletRow>();

    for (const row of rows.results ?? []) {
      if ((SUPPORTED_NETWORKS as readonly string[]).includes(row.network) && row.address?.trim()) {
        const net = row.network as SupportedNetwork;
        // Avoid duplicates (keep most-recently-updated per network)
        if (!wallets.find((w) => w.network === net)) {
          wallets.push({
            network: net,
            token: NETWORK_TOKEN[net],
            walletAddress: row.address.trim(),
          });
        }
      }
    }
  } catch {
    // DB may be unavailable during cold start; fall through to env fallback.
  }

  // Env fallback for TRC20 if no DB row exists
  if (!wallets.find((w) => w.network === 'TRC20')) {
    const envAddr = process.env.USDT_TRC20_WALLET_ADDRESS?.trim();
    if (envAddr) wallets.push({ network: 'TRC20', token: 'USDT', walletAddress: envAddr });
  }

  return wallets;
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

    const wallets = await resolveActiveWallets(db);
    if (wallets.length === 0) return apiJsonError('Crypto wallet not configured', 503);

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
      // Return all active wallets so the customer can pick their preferred network
      wallets,
      // Legacy single-wallet field for backwards compatibility
      payment: wallets[0],
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
    const network = (body.network?.trim().toUpperCase() || 'TRC20') as SupportedNetwork;
    const walletFrom = body.walletFrom?.trim() || null;
    const proofUrl = body.proofUrl?.trim() || null;
    const amountCrypto = parseAmountCrypto(body.amountCrypto);

    if (!orderId || !customerEmail || !txHash) {
      return apiJsonError('orderId, customerEmail, and txHash are required', 400);
    }
    if (!(SUPPORTED_NETWORKS as readonly string[]).includes(network)) {
      return apiJsonError(`Unsupported network. Allowed: ${SUPPORTED_NETWORKS.join(', ')}`, 400);
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
