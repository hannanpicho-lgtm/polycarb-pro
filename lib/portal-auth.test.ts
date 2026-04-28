import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  PORTAL_COOKIE,
  buildSessionCookie,
  generateMagicToken,
  getPortalSessionEmail,
  verifySessionCookie,
} from './portal-auth';

const TEST_SECRET = 'test-portal-session-secret';

function mockRequestWithCookie(cookieValue: string | undefined): NextRequest {
  return {
    cookies: {
      get: (name: string) =>
        name === PORTAL_COOKIE && cookieValue !== undefined ? { value: cookieValue } : undefined,
    },
  } as unknown as NextRequest;
}

describe('generateMagicToken', () => {
  it('returns 64 hex chars (32 bytes)', async () => {
    const t = await generateMagicToken();
    expect(t).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns distinct values across calls (with overwhelming probability)', async () => {
    const a = await generateMagicToken();
    const b = await generateMagicToken();
    expect(a).not.toBe(b);
  });
});

describe('portal session cookie', () => {
  beforeEach(() => {
    process.env.PORTAL_SECRET = TEST_SECRET;
  });
  afterEach(() => {
    delete process.env.PORTAL_SECRET;
    delete process.env.ADMIN_PASSWORD;
  });

  it('builds a signed cookie and verify returns the email', async () => {
    const email = 'user@client.com';
    const raw = await buildSessionCookie(email);
    expect(raw).toMatch(/^.+\.[\da-f]+$/);
    expect(await verifySessionCookie(raw)).toBe(email);
  });

  it('returns null when the signature is wrong', async () => {
    const b64 = btoa('user@client.com');
    expect(await verifySessionCookie(`${b64}.${'0'.repeat(64)}`)).toBeNull();
  });

  it('returns null when the cookie is not two parts', async () => {
    expect(await verifySessionCookie('nope')).toBeNull();
  });

  it('returns null when the payload is not valid base64 for atob', async () => {
    expect(
      await verifySessionCookie(
        '!!!.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      )
    ).toBeNull();
  });

  it('getSecret: throws when neither PORTAL_SECRET nor ADMIN_PASSWORD is set', async () => {
    delete process.env.PORTAL_SECRET;
    await expect(buildSessionCookie('x@y.com')).rejects.toThrow(/PORTAL_SECRET/);
  });

  it('uses ADMIN_PASSWORD when PORTAL_SECRET is unset', async () => {
    delete process.env.PORTAL_SECRET;
    process.env.ADMIN_PASSWORD = 'admin-fallback';
    const email = 'alt@client.com';
    const raw = await buildSessionCookie(email);
    expect(await verifySessionCookie(raw)).toBe(email);
  });

  it('getPortalSessionEmail: null when cookie missing', async () => {
    expect(await getPortalSessionEmail(mockRequestWithCookie(undefined))).toBeNull();
  });

  it('getPortalSessionEmail: returns email from valid cookie', async () => {
    const email = 'in@req.com';
    const raw = await buildSessionCookie(email);
    expect(await getPortalSessionEmail(mockRequestWithCookie(raw))).toBe(email);
  });
});
