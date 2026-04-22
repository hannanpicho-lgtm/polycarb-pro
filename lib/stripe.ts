import Stripe from 'stripe';

// Lazily initialised so the module can be imported without the key present at build time
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  if (!_stripe) {
    _stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia',
      // Cloudflare Workers uses the fetch API natively
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return _stripe;
}

export default getStripe;
