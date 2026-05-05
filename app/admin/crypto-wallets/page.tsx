'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Base58 TRC20: starts with T, 34 chars total
const TRC20_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

const SUPPORTED_NETWORKS = ['TRC20'] as const;
type Network = (typeof SUPPORTED_NETWORKS)[number];

interface WalletSetting {
  id: string;
  network: string;
  address: string;
  label: string | null;
  notes: string | null;
  isActive: number;
  updatedBy: string | null;
  updatedAt: string;
}

interface FormState {
  network: Network;
  address: string;
  label: string;
  notes: string;
}

const EMPTY_FORM: FormState = { network: 'TRC20', address: '', label: '', notes: '' };

function validateAddress(network: Network, address: string): string | null {
  if (!address.trim()) return 'Address is required';
  if (network === 'TRC20' && !TRC20_RE.test(address.trim())) {
    return 'Invalid TRC20 address — must start with T and be exactly 34 Base58 characters';
  }
  return null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CryptoWalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  // Toggle active
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/crypto-wallets');
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load wallets');
      const data = await res.json();
      setWallets(data.wallets ?? []);
    } catch {
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const addrErr = validateAddress(addForm.network, addForm.address);
    if (addrErr) {
      setAddError(addrErr);
      return;
    }
    setAddError('');
    setAdding(true);
    try {
      const res = await fetch('/api/admin/crypto-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: addForm.network,
          address: addForm.address.trim(),
          label: addForm.label.trim() || null,
          notes: addForm.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? 'Failed to add wallet');
        return;
      }
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
      await fetchWallets();
    } catch {
      setAddError('Network error — please try again');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(wallet: WalletSetting) {
    setEditingId(wallet.id);
    setEditForm({
      network: wallet.network as Network,
      address: wallet.address,
      label: wallet.label ?? '',
      notes: wallet.notes ?? '',
    });
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError('');
  }

  async function handleSaveEdit(wallet: WalletSetting) {
    const addrErr = validateAddress(editForm.network, editForm.address);
    if (addrErr) {
      setEditError(addrErr);
      return;
    }
    setEditError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/crypto-wallets/${wallet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: editForm.address.trim(),
          label: editForm.label.trim() || null,
          notes: editForm.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? 'Failed to save');
        return;
      }
      setEditingId(null);
      await fetchWallets();
    } catch {
      setEditError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(wallet: WalletSetting) {
    const newActive = wallet.isActive === 1 ? 0 : 1;
    const confirmMsg =
      newActive === 0
        ? `Disable wallet ${wallet.address.slice(0, 8)}…? Crypto payment instructions will fail until another wallet is activated.`
        : `Set ${wallet.address.slice(0, 8)}… as the active ${wallet.network} wallet? This will deactivate any other active wallet on this network.`;
    if (!confirm(confirmMsg)) return;

    setTogglingId(wallet.id);
    try {
      const res = await fetch(`/api/admin/crypto-wallets/${wallet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Failed to update wallet status');
        return;
      }
      await fetchWallets();
    } catch {
      alert('Network error — please try again');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Crypto Wallets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage receiving addresses for crypto payments. Only one wallet per network can be
            active at a time.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setAddError('');
              setAddForm(EMPTY_FORM);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Wallet
          </button>
        )}
      </div>

      {/* Add wallet form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">New Wallet</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Network</label>
                <select
                  value={addForm.network}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, network: e.target.value as Network }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {SUPPORTED_NETWORKS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.address}
                  onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="T…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
                <input
                  type="text"
                  value={addForm.label}
                  onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Main USDT wallet"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={addForm.notes}
                  onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Internal notes (optional)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
            {addError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {addError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Saving…' : 'Save Wallet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddError('');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : wallets.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 text-sm">No wallets configured yet.</p>
            <p className="text-slate-400 text-xs mt-1">
              Add a wallet above to enable crypto payment instructions for customers.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">
                  Network
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">
                  Label
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">
                  Updated
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wallets.map((wallet) =>
                editingId === wallet.id ? (
                  /* Inline edit row */
                  <tr key={wallet.id} className="bg-brand-50/50">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-700">
                        {wallet.network}
                      </span>
                    </td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                          placeholder="T…"
                          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editForm.label}
                            onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                            placeholder="Label"
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
                          />
                          <input
                            type="text"
                            value={editForm.notes}
                            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                            placeholder="Notes"
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
                          />
                        </div>
                        {editError && <p className="text-xs text-red-600">{editError}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(wallet)}
                          disabled={saving}
                          className="px-2.5 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Display row */
                  <tr key={wallet.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {wallet.network}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-700 break-all">
                        {wallet.address}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {wallet.label ? (
                        <span className="text-sm text-slate-700">{wallet.label}</span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {wallet.isActive === 1 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(wallet.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(wallet)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(wallet)}
                          disabled={togglingId === wallet.id}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            wallet.isActive === 1
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {togglingId === wallet.id
                            ? '…'
                            : wallet.isActive === 1
                              ? 'Disable'
                              : 'Set Active'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Notes */}
      <p className="mt-4 text-xs text-slate-400">
        When a customer is sent crypto payment instructions, the currently active wallet address is
        used. If no wallet is active, the system falls back to the{' '}
        <code className="font-mono">USDT_TRC20_WALLET_ADDRESS</code> environment variable.
      </p>
    </div>
  );
}
