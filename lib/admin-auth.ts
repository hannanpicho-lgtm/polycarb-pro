export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

export async function computeAdminToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`polycarb-admin:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
