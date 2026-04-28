import { describe, expect, it } from 'vitest';
import { computeAdminToken } from './admin-auth';

describe('computeAdminToken', () => {
  it('produces 64 hex chars (sha256 of prefixed password bytes)', async () => {
    const t = await computeAdminToken('admin');
    expect(t).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for the same password', async () => {
    const a = await computeAdminToken('same');
    const b = await computeAdminToken('same');
    expect(b).toBe(a);
  });

  it('differs for different passwords', async () => {
    const a = await computeAdminToken('a');
    const b = await computeAdminToken('b');
    expect(b).not.toBe(a);
  });
});
