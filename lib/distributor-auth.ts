export const DIST_COOKIE = 'dist_session';
export const DIST_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type DiscountTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const TIER_CONFIG: Record<DiscountTier, { label: string; discount: number; color: string; badge: string }> = {
  bronze:   { label: 'Bronze',   discount: 0.10, color: 'text-amber-700 bg-amber-50 border-amber-200',    badge: '🥉' },
  silver:   { label: 'Silver',   discount: 0.15, color: 'text-slate-600 bg-slate-100 border-slate-300',   badge: '🥈' },
  gold:     { label: 'Gold',     discount: 0.20, color: 'text-yellow-700 bg-yellow-50 border-yellow-200', badge: '🥇' },
  platinum: { label: 'Platinum', discount: 0.25, color: 'text-violet-700 bg-violet-50 border-violet-200', badge: '💎' },
};

export function applyTierDiscount(listPriceUSD: number, tier: DiscountTier): number {
  const discount = TIER_CONFIG[tier]?.discount ?? 0.10;
  return Math.round(listPriceUSD * (1 - discount) * 100) / 100;
}

function getSecret(): string {
  const s = process.env.PORTAL_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('PORTAL_SECRET env var required');
  return s;
}

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function buildDistSessionCookie(email: string): Promise<string> {
  const secret = getSecret();
  const sig = await hmac(`distributor:${email}`, secret);
  return `${btoa(email)}.${sig}`;
}

export async function verifyDistSessionCookie(cookie: string): Promise<string | null> {
  try {
    const [b64, sig] = cookie.split('.');
    if (!b64 || !sig) return null;
    const email = atob(b64);
    const secret = getSecret();
    const expected = await hmac(`distributor:${email}`, secret);
    return expected === sig ? email : null;
  } catch {
    return null;
  }
}
