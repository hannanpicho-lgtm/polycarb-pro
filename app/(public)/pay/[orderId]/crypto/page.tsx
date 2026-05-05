'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/pricing';

interface PaymentData {
  order: {
    id: string;
    referenceId: string;
    customerEmail: string;
    total: number;
    currency: string;
    paymentStatus: string;
  };
  payment: {
    network: string;
    token: string;
    walletAddress: string;
  };
}

export default function CryptoPaymentPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = useMemo(() => String(params?.orderId ?? ''), [params]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<PaymentData | null>(null);
  const [email, setEmail] = useState('');
  const [txHash, setTxHash] = useState('');
  const [walletFrom, setWalletFrom] = useState('');
  const [amountCrypto, setAmountCrypto] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/crypto/submit?orderId=${encodeURIComponent(orderId)}`);
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? 'Failed to load payment instructions');
        if (cancelled) return;
        setData(payload);
        setEmail(payload.order.customerEmail ?? '');
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load payment instructions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function copyWalletAddress() {
    if (!data?.payment.walletAddress) return;
    try {
      await navigator.clipboard.writeText(data.payment.walletAddress);
    } catch {
      // Ignore clipboard failures gracefully.
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/crypto/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.order.id,
          customerEmail: email,
          network: 'TRC20',
          txHash,
          walletFrom: walletFrom || undefined,
          amountCrypto: amountCrypto || undefined,
          proofUrl: proofUrl || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to submit payment proof');
      setDone(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit payment proof');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto py-24 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-24">
        <div className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error || 'Unable to load payment information.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 mb-2">
            Crypto Payment
          </p>
          <h1 className="text-3xl font-bold text-foreground font-display">USDT (TRC20) Payment</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Send payment for order <span className="font-mono">{data.order.referenceId}</span>, then
            submit your transaction hash for manual verification.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Payment Instructions
          </p>
          <p className="text-sm text-foreground">
            Amount due:{' '}
            <span className="font-semibold">
              {formatPrice(data.order.total, data.order.currency as 'USD' | 'AUD')}
            </span>
          </p>
          <p className="text-sm text-foreground">
            Network: <span className="font-semibold">TRC20</span> (USDT only)
          </p>
          <div className="rounded border border-border bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
              Wallet Address
            </p>
            <p className="font-mono text-xs break-all text-foreground">
              {data.payment.walletAddress}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={copyWalletAddress}
            >
              Copy Wallet Address
            </Button>
          </div>
        </div>

        {done ? (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-800">Payment proof submitted.</p>
            <p className="text-xs text-emerald-700 mt-1">
              Our team will verify your transaction and update order status shortly.
            </p>
            <Link
              href="/track"
              className="inline-block mt-3 text-xs font-semibold text-emerald-800"
            >
              Track order status →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-lg border border-border bg-card p-5 space-y-4"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Submit Transaction Proof
            </p>
            {submitError ? (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {submitError}
              </div>
            ) : null}

            <div>
              <Label htmlFor="email">Order Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="txHash">Transaction Hash *</Label>
              <Input
                id="txHash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste blockchain transaction hash"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amountCrypto">Amount Sent (USDT)</Label>
                <Input
                  id="amountCrypto"
                  type="number"
                  step="0.000001"
                  min="0"
                  value={amountCrypto}
                  onChange={(e) => setAmountCrypto(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="walletFrom">Sender Wallet (optional)</Label>
                <Input
                  id="walletFrom"
                  value={walletFrom}
                  onChange={(e) => setWalletFrom(e.target.value)}
                  placeholder="TRC20 wallet address"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="proofUrl">Proof URL (optional screenshot link)</Label>
              <Input
                id="proofUrl"
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
