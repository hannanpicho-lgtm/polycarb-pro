import { describe, expect, it } from 'vitest';
import { checkRateLimit, getRateLimitKey } from './rate-limit';

describe('getRateLimitKey', () => {
  it('joins action and ip', () => {
    expect(getRateLimitKey('quote', '1.2.3.4')).toBe('quote:1.2.3.4');
  });
  it('uses unknown when ip is null', () => {
    expect(getRateLimitKey('contact', null)).toBe('contact:unknown');
  });
});

describe('checkRateLimit', () => {
  it('allows requests up to the limit and blocks after', () => {
    const key = `rl-${Date.now()}-${Math.random()}`;
    const limit = 3;
    const windowMs = 60_000;
    expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);
  });

  it('treats each key independently', () => {
    const a = `a-${Date.now()}`;
    const b = `b-${Date.now()}`;
    expect(checkRateLimit(a, 1, 60_000)).toBe(true);
    expect(checkRateLimit(a, 1, 60_000)).toBe(false);
    expect(checkRateLimit(b, 1, 60_000)).toBe(true);
  });
});
