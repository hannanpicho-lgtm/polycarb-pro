import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';

// Base58 TRC20: starts with T, 34 chars total, Base58 alphabet (no 0, O, I, l)
const TRC20_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

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

    if (network === 'TRC20' && !TRC20_RE.test(address)) {
      return apiJsonError(
        'Invalid TRC20 address — must start with T and be exactly 34 Base58 characters',
        400
      );
    }

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
