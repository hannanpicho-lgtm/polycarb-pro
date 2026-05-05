import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

const TRC20_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

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
      if (wallet.network === 'TRC20' && !TRC20_RE.test(addr)) {
        return apiJsonError(
          'Invalid TRC20 address — must start with T and be exactly 34 Base58 characters',
          400
        );
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
