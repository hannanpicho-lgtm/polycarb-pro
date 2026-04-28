import { describe, expect, it } from 'vitest';
import { apiJsonError } from './api-json-error';

describe('apiJsonError', () => {
  it('returns JSON { error } with the given status', async () => {
    const res = apiJsonError('Not found', 404);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('merges optional extra fields after error', async () => {
    const res = apiJsonError('Email send failed', 502, { detail: 'smtp' });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Email send failed', detail: 'smtp' });
  });
});
