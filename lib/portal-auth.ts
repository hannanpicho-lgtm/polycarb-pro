// Stateless portal session — email signed with PORTAL_SECRET (falls back to ADMIN_PASSWORD)
// Cookie value: `<base64(email)>.<sha256(email + secret)>`

export const PORTAL_COOKIE = 'portal_session';
export const PORTAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const MAGIC_LINK_TTL_MINUTES = 30;

function getSecret(): string {
  const s = process.env.PORTAL_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('PORTAL_SECRET or ADMIN_PASSWORD env var required');
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

export async function generateMagicToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function buildSessionCookie(email: string): Promise<string> {
  const secret = getSecret();
  const sig = await hmac(`portal:${email}`, secret);
  return `${btoa(email)}.${sig}`;
}

export async function verifySessionCookie(cookie: string): Promise<string | null> {
  try {
    const [b64, sig] = cookie.split('.');
    if (!b64 || !sig) return null;
    const email = atob(b64);
    const secret = getSecret();
    const expected = await hmac(`portal:${email}`, secret);
    return expected === sig ? email : null;
  } catch {
    return null;
  }
}
