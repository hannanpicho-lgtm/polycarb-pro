import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Cloudflare D1 binding from the OpenNext / worker `env`.
 * Returns `null` when `DB` is missing; may throw if `getCloudflareContext` is unavailable (callers typically wrap in try/catch).
 */
export async function getD1(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

/** Same as {@link getD1} but returns `null` on any error (e.g. static build / missing worker context). */
export async function getD1Safe(): Promise<D1Database | null> {
  try {
    return await getD1();
  } catch {
    return null;
  }
}
