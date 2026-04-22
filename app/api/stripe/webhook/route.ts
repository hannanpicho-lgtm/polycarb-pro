import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { getStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

async function getDB(): Promise<D1Database | null> {
  const { env } = await getCloudflareContext({ async: true });
  return ((env as Record<string, unknown>)['DB'] as D1Database) ?? null;
}

// Stripe sends raw body — we must read it as text before any parsing
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const orderId = invoice.metadata?.orderId;
        if (!orderId) break;

        const now = new Date().toISOString();
        await db.prepare(
          `UPDATE orders SET paymentStatus = 'paid', updatedAt = ? WHERE id = ?`
        ).bind(now, orderId).run();

        await db.prepare(
          `UPDATE payments SET status = 'succeeded', paidAt = ? WHERE stripeInvoiceId = ?`
        ).bind(now, invoice.id).run();

        console.log(`[stripe] Invoice paid for order ${orderId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const orderId = invoice.metadata?.orderId;
        if (!orderId) break;

        await db.prepare(
          `UPDATE payments SET status = 'failed' WHERE stripeInvoiceId = ?`
        ).bind(invoice.id).run();

        console.warn(`[stripe] Payment failed for order ${orderId}`);
        break;
      }

      case 'invoice.voided':
      case 'invoice.marked_uncollectible': {
        const invoice = event.data.object as Stripe.Invoice;
        await db.prepare(
          `UPDATE payments SET status = 'failed' WHERE stripeInvoiceId = ?`
        ).bind(invoice.id).run();
        break;
      }

      default:
        // Unhandled — that's fine
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Return 200 so Stripe doesn't retry — log the error for investigation
  }

  return NextResponse.json({ received: true });
}
