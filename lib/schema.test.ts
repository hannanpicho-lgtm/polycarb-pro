import { describe, expect, it } from 'vitest';
import { contactSchema, quoteRequestSchema } from './schema';

const validQuote = {
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.co',
  company: 'Co',
  product: 'Sheet',
  message: 'Ten chars ok details here',
  acceptTerms: true as const,
};

describe('quoteRequestSchema', () => {
  it('accepts a minimal valid payload', () => {
    const r = quoteRequestSchema.safeParse(validQuote);
    expect(r.success).toBe(true);
  });
  it('rejects when terms are not accepted', () => {
    const r = quoteRequestSchema.safeParse({ ...validQuote, acceptTerms: false });
    expect(r.success).toBe(false);
  });
  it('rejects short message', () => {
    const r = quoteRequestSchema.safeParse({ ...validQuote, message: 'short' });
    expect(r.success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('accepts a minimal valid payload', () => {
    const r = contactSchema.safeParse({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.co',
      subject: 'Hello',
      message: 'At least ten characters in body',
    });
    expect(r.success).toBe(true);
  });
});
