'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/pricing';

interface WalletOption {
  network: string;
  token: string;
  walletAddress: string;
}

interface PaymentData {
  order: {
    id: string;
    referenceId: string;
    customerEmail: string;
    total: number;
    currency: string;
    paymentStatus: string;
  };
  wallets: WalletOption[];
  payment: WalletOption; // legacy / first wallet
}

const EXPLORER_URL: Record<string, string> = {
  TRC20: 'https://tronscan.org/#/transaction/',
  ETH: 'https://etherscan.io/tx/',
  USDC: 'https://etherscan.io/tx/',
  BTC: 'https://mempool.space/tx/',
};

export default function CryptoPaymentPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = useMemo(() => String(params?.orderId ?? ''), [params]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<PaymentData | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [email, setEmail] = useState('');
  const [txHash, setTxHash] = useState('');
  const [walletFrom, setWalletFrom] = useState('');
  const [amountCrypto, setAmountCrypto] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [copied, setCopied] = useState(false);

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
        // Pre-select first available network
        const firstNet = (payload.wallets?.[0] ?? payload.payment)?.network;
        if (firstNet) setSelectedNetwork(firstNet);
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

  const activeWallet =
    data?.wallets?.find((w) => w.network === selectedNetwork) ?? data?.payment ?? null;

  async function copyWalletAddress() {
    if (!activeWallet?.walletAddress) return;
    try {
      await navigator.clipboard.writeText(activeWallet.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures gracefully.
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || !activeWallet) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/crypto/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.order.id,
          customerEmail: email,
          network: activeWallet.network,
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
          <h1 className="text-3xl font-bold text-foreground font-display">Crypto Payment</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Send payment for order <span className="font-mono">{data.order.referenceId}</span>, then
            submit your transaction hash for manual verification.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Payment Instructions
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(data.order.total, data.order.currency as 'USD' | 'AUD')}
            </p>
          </div>

          {/* Network selector tabs */}
          {(data.wallets?.length ?? 0) > 1 && (
            <div className="flex flex-wrap gap-2">
              {data.wallets.map((w) => (
                <button
                  key={w.network}
                  type="button"
                  onClick={() => setSelectedNetwork(w.network)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    selectedNetwork === w.network
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {w.token} ({w.network})
                </button>
              ))}
            </div>
          )}

          {activeWallet && (
            <div className="rounded border border-border bg-muted/40 p-3 space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {activeWallet.token} ({activeWallet.network}) Wallet Address
              </p>
              <p className="font-mono text-xs break-all text-foreground">
                {activeWallet.walletAddress}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyWalletAddress}>
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
              </div>
            </div>
          )}
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
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="txHash">Transaction Hash *</Label>
                {txHash && activeWallet && EXPLORER_URL[activeWallet.network] && (
                  <a
                    href={`${EXPLORER_URL[activeWallet.network]}${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-brand-600 hover:underline"
                  >
                    View on explorer ↗
                  </a>
                )}
              </div>
              <Input
                id="txHash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste your transaction hash / TXID"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amountCrypto">
                  Amount Sent ({activeWallet?.token ?? 'Crypto'})
                </Label>
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
                <Label htmlFor="walletFrom">Your Sending Wallet (optional)</Label>
                <Input
                  id="walletFrom"
                  value={walletFrom}
                  onChange={(e) => setWalletFrom(e.target.value)}
                  placeholder={`Your ${activeWallet?.network ?? ''} wallet address`}
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
