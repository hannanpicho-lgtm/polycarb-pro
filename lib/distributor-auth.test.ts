import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DiscountTier } from './distributor-auth';
import {
  applyTierDiscount,
  buildDistSessionCookie,
  verifyDistSessionCookie,
} from './distributor-auth';

const TEST_SECRET = 'test-portal-hmac-secret';

describe('applyTierDiscount', () => {
  it('applies each tier’s discount to list price', () => {
    expect(applyTierDiscount(100, 'bronze')).toBe(90);
    expect(applyTierDiscount(100, 'silver')).toBe(85);
    expect(applyTierDiscount(100, 'gold')).toBe(80);
    expect(applyTierDiscount(100, 'platinum')).toBe(75);
  });

  it('rounds to two decimal places in USD', () => {
    expect(applyTierDiscount(10.03, 'bronze')).toBe(9.03);
  });

  it('uses 10% fallback when tier is not a known key', () => {
    expect(applyTierDiscount(100, 'void' as DiscountTier)).toBe(90);
  });
});

describe('distributor session cookie', () => {
  beforeEach(() => {
    process.env.PORTAL_SECRET = TEST_SECRET;
  });
  afterEach(() => {
    delete process.env.PORTAL_SECRET;
    delete process.env.ADMIN_PASSWORD;
  });

  it('builds a signed cookie and verify returns the email', async () => {
    const email = 'rep@distributor.com';
    const cookie = await buildDistSessionCookie(email);
    expect(cookie).toMatch(/^.+\.[\da-f]+$/);
    expect(await verifyDistSessionCookie(cookie)).toBe(email);
  });

  it('returns null when the signature is wrong', async () => {
    const b64 = btoa('rep@distributor.com');
    const wrong = `${b64}.${'0'.repeat(64)}`;
    expect(await verifyDistSessionCookie(wrong)).toBeNull();
  });

  it('returns null when the cookie is not two dot-separated parts', async () => {
    expect(await verifyDistSessionCookie('nope')).toBeNull();
  });

  it('returns null when the payload is not valid base64 for atob', async () => {
    expect(
      await verifyDistSessionCookie(
        '!!!.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      )
    ).toBeNull();
  });

  it('getSecret: throws when neither PORTAL_SECRET nor ADMIN_PASSWORD is set', async () => {
    delete process.env.PORTAL_SECRET;
    await expect(buildDistSessionCookie('x@y.com')).rejects.toThrow(/PORTAL_SECRET/);
  });

  it('uses ADMIN_PASSWORD when PORTAL_SECRET is unset', async () => {
    delete process.env.PORTAL_SECRET;
    process.env.ADMIN_PASSWORD = 'admin-fallback-secret';
    const email = 'alt@distributor.com';
    const cookie = await buildDistSessionCookie(email);
    expect(await verifyDistSessionCookie(cookie)).toBe(email);
  });
});
