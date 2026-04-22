'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { shippingRegions } from '@/lib/pricing';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  region: string;
  currency: string;
  notes?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', phone: '', region: 'international', currency: 'USD', notes: '' });

  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ limit: '50', offset: '0', search });
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.status === 401) { router.replace('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCustomers(data.customers ?? []);
      setTotal(data.total ?? 0);
    } catch { setError('Failed to load customers'); }
    finally { setLoading(false); }
  }, [search, router]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', company: '', phone: '', region: 'international', currency: 'USD', notes: '' });
      fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
          + New Customer
        </button>
      </div>

      {/* New customer form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">New Customer</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            {([
              ['First name', 'firstName', 'text', true],
              ['Last name', 'lastName', 'text', true],
              ['Email', 'email', 'email', true],
              ['Company', 'company', 'text', false],
              ['Phone', 'phone', 'tel', false],
            ] as [string, string, string, boolean][]).map(([label, key, type, req]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}{req && ' *'}</label>
                <input type={type} required={req} value={(form as Record<string, string>)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Region</label>
              <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40">
                {shippingRegions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                <option value="international">International (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40">
                <option value="USD">USD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
            </div>
            {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Create Customer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, company…"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-72" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : error && customers.length === 0 ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No customers yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Company', 'Region', 'Currency', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-500">{c.company || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{c.region.replace('-', ' ')}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{c.currency}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
