'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'That link is invalid. Please request a new one.',
  expired: 'That link has expired. Please request a new one.',
  used: 'That link has already been used. Request a fresh one.',
  missing_token: 'Incomplete link. Please enter your email again.',
  not_found:
    'No distributor account found for that email. Contact us if you believe this is an error.',
  service: 'Service unavailable. Please try again shortly.',
};

function DistributorLogin() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get('error');
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);
    try {
      const res = await fetch('/api/distributor/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSent(true);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001a2e] to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-700/20 border border-brand-400/30 flex items-center justify-center shadow-lg shadow-brand-900/30">
              <svg
                className="w-8 h-8 text-brand-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">Distributor Portal</p>
              <p className="text-sm text-brand-300/70 mt-0.5">
                Covestro Polycarbonates Partner Network
              </p>
            </div>
          </Link>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 shadow-2xl ring-1 ring-inset ring-white/5">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg
                className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                If <span className="text-white font-medium">{email}</span> is in our partner
                network, you&apos;ll receive a sign-in link within moments.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Partner sign-in</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Enter your registered partner email and we&apos;ll send you a secure, passwordless
                sign-in link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Partner email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-colors"
                  />
                </div>
                {submitError && <p className="text-sm text-red-400">{submitError}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white font-semibold text-sm transition-colors"
                >
                  {loading ? 'Sending…' : 'Send sign-in link →'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Not a partner yet?{' '}
            <Link
              href="/#distributor"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Apply to join our network
            </Link>
          </p>
          <p className="text-xs text-slate-700">
            Customer?{' '}
            <Link href="/portal" className="text-slate-500 hover:text-slate-300 transition-colors">
              Go to customer portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DistributorPage() {
  return (
    <Suspense>
      <DistributorLogin />
    </Suspense>
  );
}
