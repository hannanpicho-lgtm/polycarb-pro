import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

// Supported network keys and their address validation rules.
// TRC20  = USDT on Tron
// ETH    = Native Ether on Ethereum
// USDC   = USDC on Ethereum (ERC-20)
// BTC    = Bitcoin
export const SUPPORTED_NETWORKS = ['TRC20', 'ETH', 'USDC', 'BTC'] as const;
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

const ADDRESS_RE: Record<SupportedNetwork, RegExp> = {
  TRC20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/, // Base58, 34 chars, starts with T
  ETH: /^0x[0-9a-fA-F]{40}$/, // Hex, 42 chars
  USDC: /^0x[0-9a-fA-F]{40}$/, // Same EVM format as ETH
  BTC: /^(1[1-9A-HJ-NP-Za-km-z]{24,33}|3[1-9A-HJ-NP-Za-km-z]{24,33}|bc1[ac-hj-np-z02-9]{6,87})$/, // P2PKH / P2SH / bech32
};

const ADDRESS_HINT: Record<SupportedNetwork, string> = {
  TRC20: 'Must start with T and be exactly 34 Base58 characters',
  ETH: 'Must be a valid Ethereum address (0x followed by 40 hex characters)',
  USDC: 'Must be a valid Ethereum address (0x followed by 40 hex characters)',
  BTC: 'Must be a valid Bitcoin address (P2PKH starting with 1, P2SH starting with 3, or bech32 starting with bc1)',
};

function validateAddress(network: SupportedNetwork, address: string): string | null {
  if (!ADDRESS_RE[network].test(address)) return ADDRESS_HINT[network];
  return null;
}

export interface WalletSetting {
  id: string;
  network: string;
  address: string;
  label: string | null;
  notes: string | null;
  isActive: number;
  updatedBy: string | null;
  updatedAt: string;
}

export async function GET() {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const result = await db
      .prepare(
        `SELECT id, network, address, label, notes, isActive, updatedBy, updatedAt
         FROM payment_wallet_settings
         ORDER BY network ASC, updatedAt DESC`
      )
      .all<WalletSetting>();

    return NextResponse.json({ ok: true, wallets: result.results ?? [] });
  } catch (error) {
    console.error('GET /api/admin/crypto-wallets failed', error);
    return apiJsonError('Failed to load wallets', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const body = (await request.json()) as {
      network?: string;
      address?: string;
      label?: string;
      notes?: string;
    };

    const network = body.network?.trim().toUpperCase();
    const address = body.address?.trim();
    const label = body.label?.trim() || null;
    const notes = body.notes?.trim() || null;

    if (!network) return apiJsonError('network is required', 400);
    if (!address) return apiJsonError('address is required', 400);

    if (!(SUPPORTED_NETWORKS as readonly string[]).includes(network)) {
      return apiJsonError(`Unsupported network. Allowed: ${SUPPORTED_NETWORKS.join(', ')}`, 400);
    }

    const addrError = validateAddress(network as SupportedNetwork, address);
    if (addrError) return apiJsonError(`Invalid address — ${addrError}`, 400);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Enforce one active wallet per network: deactivate existing active wallets first
    await db
      .prepare(
        `UPDATE payment_wallet_settings
         SET isActive = 0, updatedAt = ?
         WHERE network = ? AND isActive = 1`
      )
      .bind(now, network)
      .run();

    await db
      .prepare(
        `INSERT INTO payment_wallet_settings
         (id, network, address, label, notes, isActive, updatedAt)
         VALUES (?, ?, ?, ?, ?, 1, ?)`
      )
      .bind(id, network, address, label, notes, now)
      .run();

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/crypto-wallets failed', error);
    return apiJsonError('Failed to create wallet', 500);
  }
}
