import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { SUPPORTED_NETWORKS, type SupportedNetwork } from '../route';

const ADDRESS_RE: Record<SupportedNetwork, RegExp> = {
  TRC20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  ETH: /^0x[0-9a-fA-F]{40}$/,
  USDC: /^0x[0-9a-fA-F]{40}$/,
  BTC: /^(1[1-9A-HJ-NP-Za-km-z]{24,33}|3[1-9A-HJ-NP-Za-km-z]{24,33}|bc1[ac-hj-np-z02-9]{6,87})$/,
};

const ADDRESS_HINT: Record<SupportedNetwork, string> = {
  TRC20: 'Must start with T and be exactly 34 Base58 characters',
  ETH: 'Must be a valid Ethereum address (0x followed by 40 hex characters)',
  USDC: 'Must be a valid Ethereum address (0x followed by 40 hex characters)',
  BTC: 'Must be a valid Bitcoin address (P2PKH / P2SH / bech32)',
};

type WalletRow = {
  id: string;
  network: string;
  address: string;
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await getD1();
    if (!db) return apiJsonError('Database unavailable', 503);

    const { id } = await params;
    if (!id?.trim()) return apiJsonError('id is required', 400);

    const body = (await request.json()) as {
      address?: string;
      label?: string;
      notes?: string;
      isActive?: number;
    };

    const wallet = await db
      .prepare(`SELECT id, network, address FROM payment_wallet_settings WHERE id = ?`)
      .bind(id)
      .first<WalletRow>();

    if (!wallet) return apiJsonError('Wallet not found', 404);

    const now = new Date().toISOString();

    // Validate new address if provided
    if (body.address !== undefined) {
      const addr = body.address.trim();
      if (!addr) return apiJsonError('address cannot be empty', 400);
      if ((SUPPORTED_NETWORKS as readonly string[]).includes(wallet.network)) {
        const re = ADDRESS_RE[wallet.network as SupportedNetwork];
        if (!re.test(addr)) {
          return apiJsonError(
            `Invalid address — ${ADDRESS_HINT[wallet.network as SupportedNetwork]}`,
            400
          );
        }
      }
    }

    // If activating this wallet, deactivate all others in the same network first
    if (body.isActive === 1) {
      await db
        .prepare(
          `UPDATE payment_wallet_settings
           SET isActive = 0, updatedAt = ?
           WHERE network = ? AND isActive = 1 AND id != ?`
        )
        .bind(now, wallet.network, id)
        .run();
    }

    // Build dynamic SET clause from provided fields only
    const sets: string[] = ['updatedAt = ?'];
    const binds: unknown[] = [now];

    if (body.address !== undefined) {
      sets.push('address = ?');
      binds.push(body.address.trim());
    }
    if (body.label !== undefined) {
      sets.push('label = ?');
      binds.push(body.label.trim() || null);
    }
    if (body.notes !== undefined) {
      sets.push('notes = ?');
      binds.push(body.notes.trim() || null);
    }
    if (body.isActive !== undefined) {
      sets.push('isActive = ?');
      binds.push(body.isActive === 1 ? 1 : 0);
    }

    binds.push(id);

    await db
      .prepare(`UPDATE payment_wallet_settings SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...(binds as Parameters<ReturnType<typeof db.prepare>['bind']>))
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/crypto-wallets/[id] failed', error);
    return apiJsonError('Failed to update wallet', 500);
  }
}
