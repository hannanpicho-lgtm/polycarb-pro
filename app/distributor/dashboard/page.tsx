'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TIER_CONFIG, type DiscountTier } from '@/lib/distributor-auth';
import { formatPrice, type Currency } from '@/lib/pricing';

type AppStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

interface DistributorProfile {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  businessType: string;
  countries: string;
  jobTitle?: string;
  status: AppStatus;
  discountTier: DiscountTier;
  approvedAt: string | null;
  createdAt: string;
}

interface DistQuote {
  id: string;
  referenceId: string;
  currency: string;
  status: string;
  products: string;
  subtotalNet: number;
  createdAt: string;
}

interface MeResponse {
  email: string;
  profile: DistributorProfile;
  quotes: DistQuote[];
}

const QUOTE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  quoted: 'bg-purple-50 text-purple-700 border-purple-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  ordered: 'bg-slate-100 text-slate-600 border-slate-200',
};

function PendingState({
  profile,
  email: _email,
  onSignOut,
}: {
  profile: DistributorProfile;
  email: string;
  onSignOut: () => void;
}) {
  const isPending = profile.status === 'pending' || profile.status === 'reviewed';
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-6 ${
            isPending ? 'border-amber-400 bg-amber-500/10' : 'border-red-400 bg-red-500/10'
          }`}
        >
          {isPending ? (
            <svg
              className="w-7 h-7 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          {isPending ? 'Application under review' : 'Application not approved'}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          {isPending
            ? `Your application for ${profile.companyName} is currently being reviewed by our team. You'll receive an email once a decision is made.`
            : 'Unfortunately your distributor application was not approved. Please contact us if you have questions.'}
        </p>
        <p className="text-slate-600 text-xs mb-6">
          Applied: {new Date(profile.createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/contact"
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Contact us
          </Link>
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DistributorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'quotes' | 'catalog'>('quotes');

  useEffect(() => {
    fetch('/api/distributor/me')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/distributor');
          return;
        }
        if (res.ok) setData(await res.json());
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSignOut() {
    await fetch('/api/distributor/me', { method: 'DELETE' });
    router.replace('/distributor');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
        Unable to load.{' '}
        <Link href="/distributor" className="ml-1 text-brand-600 hover:underline">
          Sign in again
        </Link>
      </div>
    );
  }

  const { profile, quotes } = data;

  if (profile.status !== 'approved') {
    return <PendingState profile={profile} email={data.email} onSignOut={handleSignOut} />;
  }

  const tier = (profile.discountTier || 'bronze') as DiscountTier;
  const tierInfo = TIER_CONFIG[tier];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-400/30 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-brand-500"
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
            <p className="text-sm font-semibold text-slate-800 leading-none">Partner Portal</p>
            <p className="text-[10px] text-slate-400">Covestro PC</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tierInfo.color}`}
          >
            {tierInfo.badge} {tierInfo.label} Partner
          </span>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 text-white flex items-center justify-between gap-4 overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-300 mb-1">
              Welcome back
            </p>
            <h1 className="text-2xl font-bold">{profile.companyName}</h1>
            <p className="text-slate-300 text-sm mt-0.5">
              {profile.fullName} · {profile.jobTitle ?? 'Partner'}
            </p>
          </div>
          <div className="relative text-right flex-shrink-0">
            <p
              className={`text-3xl font-black ${tierInfo.label === 'Gold' ? 'text-yellow-300' : tierInfo.label === 'Platinum' ? 'text-violet-300' : tierInfo.label === 'Silver' ? 'text-slate-200' : 'text-amber-300'}`}
            >
              {Math.round(tierInfo.discount * 100)}%
            </p>
            <p className="text-sm text-slate-300">off list price</p>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold mt-1 ${tierInfo.color}`}
            >
              {tierInfo.badge} {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Browse Catalog',
              href: '/distributor/catalog',
              icon: '📦',
              sub: 'Net prices',
            },
            {
              label: 'New Quote',
              href: '/distributor/quotes/new',
              icon: '📋',
              sub: 'Submit order request',
            },
            { label: 'Contact Team', href: '/contact', icon: '💬', sub: 'Mon–Fri 8am–5pm' },
            { label: 'View Full Site', href: '/', icon: '🌐', sub: 'Products & specs' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <p className="text-2xl mb-2">{a.icon}</p>
              <p className="text-sm font-semibold text-slate-800">{a.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{a.sub}</p>
            </Link>
          ))}
        </div>

        {/* Tabs: quote history / catalog preview */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(['quotes', 'catalog'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? 'text-brand-600 border-b-2 border-brand-500'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'quotes' ? `My Quotes (${quotes.length})` : 'Pricing Summary'}
              </button>
            ))}
          </div>

          {tab === 'quotes' && (
            <div>
              {quotes.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-400 text-sm">No quotes submitted yet.</p>
                  <Link
                    href="/distributor/quotes/new"
                    className="inline-block mt-3 text-sm text-brand-600 hover:underline font-medium"
                  >
                    Submit your first quote →
                  </Link>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Ref', 'Products', 'Net Value', 'Status', 'Date'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotes.map((q) => {
                      let products: Array<{ productName?: string; qty?: number }> = [];
                      try {
                        products = JSON.parse(q.products);
                      } catch {}
                      return (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {q.referenceId}
                          </td>
                          <td className="px-4 py-3 text-slate-700 text-xs">
                            {products
                              .map((p) => `${p.productName ?? '?'} × ${p.qty ?? '?'}kg`)
                              .join(', ')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {formatPrice(q.subtotalNet, q.currency as Currency)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${QUOTE_STATUS_COLORS[q.status] ?? ''}`}
                            >
                              {q.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(q.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'catalog' && (
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold ${tierInfo.color}`}
                >
                  {tierInfo.badge} {tierInfo.label} — {Math.round(tierInfo.discount * 100)}% off all
                  list prices
                </span>
                <Link
                  href="/distributor/catalog"
                  className="text-sm text-brand-600 hover:underline ml-auto"
                >
                  Full catalog with prices →
                </Link>
              </div>
              <p className="text-xs text-slate-500">
                All prices shown in the full catalog reflect your {tierInfo.label} tier discount
                applied to list prices. Prices are in USD by default. AUD available on request.
              </p>
            </div>
          )}
        </div>

        {/* Account details */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Account Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                Company
              </p>
              <p className="text-slate-800 font-medium">{profile.companyName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                Contact
              </p>
              <p className="text-slate-800">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                Email
              </p>
              <p className="text-slate-800 break-all">{profile.email}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                Member since
              </p>
              <p className="text-slate-800">
                {profile.approvedAt ? new Date(profile.approvedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
