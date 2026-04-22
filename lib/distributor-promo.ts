/**
 * Client-side rules for the marketing distributor promo modal.
 * — Permanent hide after application submit or if user is a distributor.
 * — Long snooze (30d) after dismiss or after one automatic display.
 */

const BLOCK = 'distributor_promo_permanent';
const QUIET = 'distributor_promo_quiet_until_ms';
const QUIET_DAYS = 30;
const LEGACY_SHOWN = 'distributor-promo-shown';

function parseMs(v: string | null): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

/** One-time: old 24h `distributor-promo-shown` → 30d quiet window */
export function migrateLegacyDistributorPromoStorage(): void {
  if (typeof window === 'undefined') return;
  const legacy = localStorage.getItem(LEGACY_SHOWN);
  if (!legacy) return;
  const started = parseInt(legacy, 10);
  localStorage.removeItem(LEGACY_SHOWN);
  if (!Number.isFinite(started)) return;
  const until = started + QUIET_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() >= until) return;
  const cur = parseMs(localStorage.getItem(QUIET));
  if (cur === null || until > cur) {
    localStorage.setItem(QUIET, String(until));
  }
}

export function distributorPromoIsPermanentlyBlocked(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(BLOCK) === '1';
}

export function distributorPromoIsInQuietPeriod(): boolean {
  if (typeof window === 'undefined') return true;
  const until = parseMs(localStorage.getItem(QUIET));
  if (until === null) return false;
  return Date.now() < until;
}

export function distributorPromoShouldSuppressClient(): boolean {
  return distributorPromoIsPermanentlyBlocked() || distributorPromoIsInQuietPeriod();
}

/** After successful application (any surface: modal, /distributors, etc.) */
export function distributorPromoMarkApplicationSubmitted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BLOCK, '1');
  try {
    localStorage.removeItem(QUIET);
  } catch {
    /* ignore */
  }
}

/** User closed modal without applying, or we just auto-showed the modal. */
export function distributorPromoMarkQuietForDays(days = QUIET_DAYS): void {
  if (typeof window === 'undefined') return;
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(QUIET, String(until));
}

/** Logged-in distributor (session) — do not show marketing modal. */
export function distributorPromoMarkDistributorSession(): void {
  distributorPromoMarkApplicationSubmitted();
}

/** One-time check: if already signed into distributor portal, persist block. */
export async function distributorPromoCheckSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (distributorPromoIsPermanentlyBlocked()) return;
  try {
    const res = await fetch('/api/distributor/me', { credentials: 'include' });
    if (res.ok) {
      localStorage.setItem(BLOCK, '1');
    }
  } catch {
    /* ignore */
  }
}
