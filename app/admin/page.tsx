'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DistributorSubmission {
  id: string;
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

interface PaginationData {
  submissions: DistributorSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

interface StatsData {
  totalSubmissions: number;
  distributorSubmissions: number;
  contactSubmissions: number;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<DistributorSubmission[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * pageSize;
      const response = await fetch(
        `/api/admin/submissions?offset=${offset}&limit=${pageSize}&email=${encodeURIComponent(searchEmail)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data: PaginationData = await response.json();
      setSubmissions(data.submissions);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data: StatsData = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [page, pageSize, searchEmail]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage distributor submissions and inquiries</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Site</Button>
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-white border-slate-200">
              <div className="text-sm font-medium text-slate-600">Total Submissions</div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{stats.totalSubmissions}</div>
            </Card>
            <Card className="p-6 bg-white border-slate-200">
              <div className="text-sm font-medium text-slate-600">Distributor Applications</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.distributorSubmissions}</div>
            </Card>
            <Card className="p-6 bg-white border-slate-200">
              <div className="text-sm font-medium text-slate-600">Contact Form Submissions</div>
              <div className="text-3xl font-bold text-emerald-600 mt-2">{stats.contactSubmissions}</div>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <Card className="p-6 bg-white border-slate-200 mb-6">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={handleSearchChange}
              className="flex-1"
            />
            {searchEmail && (
              <Button variant="outline" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
            <Button onClick={fetchSubmissions}>Search</Button>
          </div>
        </Card>

        {/* Submissions Table */}
        <Card className="bg-white border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading submissions...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">Error: {error}</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-600">No submissions found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Ref ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Full Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Business Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Volume
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          {submission.referenceId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{submission.fullName}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{submission.companyName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{submission.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{submission.phone}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{submission.businessType}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {submission.estimatedAnnualVolume}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="text-sm text-slate-600">
                  Page {page} of {totalPages} ({submissions.length} entries)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
