'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Shield, User, Loader2 } from 'lucide-react';

interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  isActive: boolean;
  image?: string | null;
  createdAt: string;
  _count?: { conversations: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/users${q}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const toggleUserActive = async (u: AppUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: u.id,
          isActive: !u.isActive
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update status');
        return;
      }

      fetchUsers();
    } catch {
      alert('Error updating user');
    }
  };

  const toggleUserRole = async (u: AppUser) => {
    const nextRole = u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    if (!confirm(`Change role for ${u.email || u.name} to ${nextRole}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: u.id,
          role: nextRole
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update role');
        return;
      }

      fetchUsers();
    } catch {
      alert('Error updating user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-heading tracking-tight">
            User Governance & Roles
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Audit registered students and platform administrators, manage security privileges, and inspect chat engagement.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E] transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#315E9E]" />
            <span>Loading registered accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Conversations</th>
                  <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="font-semibold text-[var(--text-primary)]">{u.name || 'Unnamed Student'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{u.email}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleUserRole(u)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                            : 'bg-blue-500/10 text-[#315E9E] dark:text-[#6D9FE8] border border-blue-500/25'
                        }`}
                        title="Click to toggle role"
                      >
                        {u.role === 'ADMIN' ? (
                          <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <User className="w-3 h-3 text-[#315E9E] dark:text-[#6D9FE8]" />
                        )}
                        <span>{u.role}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">
                      {u._count?.conversations || 0} chats
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}
                      >
                        {u.isActive ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleUserActive(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          u.isActive
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20'
                            : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
