'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

type SubmissionType = 'distributor' | 'contact';
type FilterType = 'all' | SubmissionType;

interface DistributorRow {
  id: string;
  type: 'distributor';
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  businessType: string;
  countries: string;
  estimatedAnnualVolume: string;
  jobTitle: string;
  message?: string;
  referenceId: string;
  submittedAt: string;
  ipAddress?: string;
  createdAt: string;
}

interface ContactRow {
  id: string;
  type: 'contact';
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  referenceId: string;
  submittedAt: string;
  ipAddress?: string;
  createdAt: string;
}

type AnySubmission = DistributorRow | ContactRow;

interface StatsData {
  totalSubmissions: number;
  distributorSubmissions: number;
  contactSubmissions: number;
}

interface PaginationData {
  submissions: AnySubmission[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function TypeBadge({ type }: { type: SubmissionType }) {
  return type === 'distributor' ? (
    <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
      Distributor
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
      Contact
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<AnySubmission[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [total, setTotal] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * pageSize;
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(pageSize),
        search: searchEmail,
      });
      if (filterType !== 'all') params.set('type', filterType);

      const res = await fetch(`/api/admin/submissions?${params}`);
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch submissions');

      const data: PaginationData = await res.json();
      setSubmissions(data.submissions ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchEmail, filterType, router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [fetchSubmissions, fetchStats]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [searchEmail, filterType]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin/login');
  }

  const tabs: { label: string; value: FilterType; count?: number }[] = [
    { label: 'All', value: 'all', count: stats?.totalSubmissions },
    {
      label: 'Distributor Applications',
      value: 'distributor',
      count: stats?.distributorSubmissions,
    },
    { label: 'Contact Enquiries', value: 'contact', count: stats?.contactSubmissions },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-sm">Admin Portal</span>
            <span className="text-slate-300 text-sm">·</span>
            <span className="text-slate-500 text-sm">Covestro Polycarbonates</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ← View site
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Distributor applications and contact enquiries from the site
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Total submissions',
                value: stats.totalSubmissions,
                color: 'text-slate-900',
              },
              {
                label: 'Distributor applications',
                value: stats.distributorSubmissions,
                color: 'text-blue-600',
              },
              {
                label: 'Contact enquiries',
                value: stats.contactSubmissions,
                color: 'text-emerald-600',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs + search */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 flex items-center justify-between px-4 gap-4 flex-wrap">
            <div className="flex items-center gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterType(tab.value)}
                  className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
                    filterType === tab.value
                      ? 'text-brand-600 border-b-2 border-brand-500'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        filterType === tab.value
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 py-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="email"
                  placeholder="Search by email…"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 outline-none transition-all w-56"
                />
              </div>
              {searchEmail && (
                <button
                  onClick={() => setSearchEmail('')}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading submissions…</div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchSubmissions}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Retry
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No submissions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Company / Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Ref
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Submitted
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => {
                    const isExpanded = expandedId === sub.id;
                    return (
                      <>
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        >
                          <td className="px-4 py-3.5">
                            <TypeBadge type={sub.type} />
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-900">
                            {sub.type === 'distributor'
                              ? sub.fullName
                              : `${sub.firstName} ${sub.lastName}`}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">{sub.email}</td>
                          <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate">
                            {sub.type === 'distributor' ? sub.companyName : sub.subject}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                            {sub.referenceId}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                            {formatDate(sub.submittedAt ?? sub.createdAt)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-right">
                            <span
                              className={`inline-block transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              ›
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${sub.id}-detail`} className="bg-slate-50/70">
                            <td colSpan={7} className="px-6 py-4">
                              {sub.type === 'distributor' ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <Detail label="Phone" value={sub.phone} />
                                  <Detail label="Job Title" value={sub.jobTitle} />
                                  <Detail label="Business Type" value={sub.businessType} />
                                  <Detail label="Annual Volume" value={sub.estimatedAnnualVolume} />
                                  <Detail label="Countries" value={sub.countries} />
                                  {sub.message && (
                                    <Detail
                                      label="Message"
                                      value={sub.message}
                                      className="col-span-2 md:col-span-3"
                                    />
                                  )}
                                  {sub.ipAddress && (
                                    <Detail label="IP Address" value={sub.ipAddress} />
                                  )}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  {sub.company && <Detail label="Company" value={sub.company} />}
                                  <Detail
                                    label="Message"
                                    value={sub.message}
                                    className="col-span-2 md:col-span-4"
                                  />
                                  {sub.ipAddress && (
                                    <Detail label="IP Address" value={sub.ipAddress} />
                                  )}
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
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && submissions.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-sm">
              <span className="text-slate-500 text-xs">
                Page {page} of {totalPages} · {total} total
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-700 mt-0.5 text-sm">{value}</p>
    </div>
  );
}
