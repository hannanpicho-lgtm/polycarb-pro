'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TIER_CONFIG, type DiscountTier } from '@/lib/distributor-auth';

type AppStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

interface DistributorApp {
  id: string;
  referenceId: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  businessType: string;
  countries: string;
  estimatedAnnualVolume: string;
  jobTitle: string;
  message?: string;
  status: AppStatus;
  discountTier: DiscountTier;
  approvedAt?: string;
  internalNotes?: string;
  createdAt: string;
  submittedAt: string;
}

const STATUS_COLORS: Record<AppStatus, string> = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const VOLUME_SCORE: Record<string, number> = {
  '< 1 tonne/year': 1, '1-5 tonnes/year': 2, '5-20 tonnes/year': 3,
  '20-100 tonnes/year': 4, '> 100 tonnes/year': 5,
};

const TIERS: DiscountTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export default function DistributorsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<DistributorApp[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Per-row state
  const [tierSelections, setTierSelections] = useState<Record<string, DiscountTier>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const fetchApps = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ limit: '50', offset: '0', type: 'distributor', search });
      const res = await fetch(`/api/admin/submissions?${params}`);
      if (res.status === 401) { router.replace('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const submissions = (data.submissions ?? []) as DistributorApp[];
      setApps(submissions);
      setTotal(data.total ?? 0);

      // Pre-seed tier selections from existing data
      const tierMap: Record<string, DiscountTier> = {};
      submissions.forEach(a => { tierMap[a.id] = a.discountTier || 'bronze'; });
      setTierSelections(prev => ({ ...tierMap, ...prev }));
    } catch { setError('Failed to load applications'); }
    finally { setLoading(false); }
  }, [search, router]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const filtered = filterStatus
    ? apps.filter(a => (a.status || 'pending') === filterStatus)
    : apps;

  async function updateApp(id: string, action: 'approve' | 'reject' | 'review') {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/distributors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          discountTier: tierSelections[id] ?? 'bronze',
          internalNotes: notesInputs[id] ?? undefined,
          rejectionReason: rejectReasons[id] ?? undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(`Failed: ${d.error}`);
        return;
      }
      fetchApps();
      if (action === 'approve') setExpandedId(null);
    } finally { setUpdatingId(null); }
  }

  function parseCountries(raw: string): string {
    try { return JSON.parse(raw).join(', '); } catch { return raw; }
  }

  function volumeScore(v: string) { return VOLUME_SCORE[v] ?? 0; }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Distributor Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total · Approve to activate portal access</p>
        </div>
        {/* Stats row */}
        <div className="flex gap-3">
          {(['pending', 'approved', 'rejected'] as AppStatus[]).map(s => {
            const count = apps.filter(a => (a.status || 'pending') === s).length;
            return (
              <button key={s} onClick={() => setFilterStatus(s === filterStatus ? '' : s)}
                className={`px-3 py-2 rounded-xl text-center transition-colors ${
                  filterStatus === s ? STATUS_COLORS[s] + ' border' : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}>
                <p className="text-lg font-bold text-slate-900">{count}</p>
                <p className="text-[10px] text-slate-500 capitalize">{s}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {(['', 'pending', 'reviewed', 'approved', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterStatus === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          className="ml-auto px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No applications</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Applicant', 'Company', 'Volume', 'Tier', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(app => {
                const status: AppStatus = (app.status as AppStatus) || 'pending';
                const isExpanded = expandedId === app.id;
                const tier = tierSelections[app.id] ?? (app.discountTier || 'bronze') as DiscountTier;
                const tierInfo = TIER_CONFIG[tier];
                const score = volumeScore(app.estimatedAnnualVolume);
                return (
                  <>
                    <tr key={app.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : app.id)}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{app.fullName}</p>
                        <p className="text-xs text-slate-400">{app.jobTitle}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{app.companyName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < score ? 'bg-brand-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{app.estimatedAnnualVolume}</p>
                      </td>
                      <td className="px-4 py-3">
                        {status === 'approved' ? (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tierInfo.color}`}>
                            {tierInfo.badge} {tierInfo.label}
                          </span>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">{isExpanded ? '▲' : '▼'}</td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${app.id}-detail`} className="bg-slate-50/60">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-3 gap-4 mb-5">
                            <Field label="Email" value={app.email} />
                            <Field label="Phone" value={app.phone} />
                            <Field label="Business Type" value={app.businessType} />
                            <Field label="Countries" value={parseCountries(app.countries)} className="col-span-2" />
                            <Field label="Annual Volume" value={app.estimatedAnnualVolume} />
                            {app.message && <Field label="Message" value={app.message} className="col-span-3" />}
                          </div>

                          {status !== 'approved' && status !== 'rejected' && (
                            <div className="border-t border-slate-200 pt-4 space-y-4">
                              {/* Tier selector */}
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Assign Distributor Tier</p>
                                <div className="flex gap-2 flex-wrap">
                                  {TIERS.map(t => {
                                    const ti = TIER_CONFIG[t];
                                    return (
                                      <button key={t} onClick={() => setTierSelections(prev => ({ ...prev, [app.id]: t }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                          tier === t ? ti.color + ' border-2' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                        {ti.badge} {ti.label} ({Math.round(ti.discount * 100)}% off)
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Internal notes */}
                              <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Internal Notes</label>
                                <textarea rows={2} value={notesInputs[app.id] ?? app.internalNotes ?? ''}
                                  onChange={e => setNotesInputs(prev => ({ ...prev, [app.id]: e.target.value }))}
                                  placeholder="Internal notes (not shown to applicant)…"
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40 bg-white" />
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 items-start">
                                {status === 'pending' && (
                                  <button onClick={() => updateApp(app.id, 'review')} disabled={updatingId === app.id}
                                    className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    Mark Reviewed
                                  </button>
                                )}
                                <button onClick={() => updateApp(app.id, 'approve')} disabled={updatingId === app.id}
                                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                  {updatingId === app.id ? 'Approving…' : `✓ Approve as ${TIER_CONFIG[tier].label}`}
                                </button>
                                <div className="flex gap-2 items-center ml-auto">
                                  <input value={rejectReasons[app.id] ?? ''} onChange={e => setRejectReasons(prev => ({ ...prev, [app.id]: e.target.value }))}
                                    placeholder="Rejection reason (optional)…"
                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none w-52 bg-white" />
                                  <button onClick={() => updateApp(app.id, 'reject')} disabled={updatingId === app.id}
                                    className="px-4 py-2 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {status === 'approved' && (
                            <div className="border-t border-slate-200 pt-4 flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold ${TIER_CONFIG[app.discountTier || 'bronze'].color}`}>
                                {TIER_CONFIG[app.discountTier || 'bronze'].badge} {TIER_CONFIG[app.discountTier || 'bronze'].label} Partner
                                &nbsp;·&nbsp; {Math.round(TIER_CONFIG[app.discountTier || 'bronze'].discount * 100)}% off list
                              </span>
                              {app.approvedAt && <p className="text-xs text-slate-400">Approved {new Date(app.approvedAt).toLocaleDateString()}</p>}
                              <a href={`mailto:${app.email}?subject=Your Covestro PC Distributor Account`}
                                className="ml-auto text-xs text-brand-600 hover:underline">Email partner →</a>
                            </div>
                          )}

                          {status === 'rejected' && (
                            <div className="border-t border-slate-200 pt-4 flex items-center gap-3">
                              <span className="text-xs text-red-600">Application rejected</span>
                              <a href={`mailto:${app.email}`} className="ml-auto text-xs text-brand-600 hover:underline">Contact applicant →</a>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value || '—'}</p>
    </div>
  );
}
