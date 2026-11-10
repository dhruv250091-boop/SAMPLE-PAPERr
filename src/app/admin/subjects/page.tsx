'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  order: number;
  _count?: { samplePapers: number };
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch {
      setErrorMsg('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
    setOrder(subjects.length + 1);
    setErrorMsg('');
    setFormOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingId(s.id);
    setName(s.name);
    setCode(s.code);
    setDescription(s.description || '');
    setIsActive(s.isActive);
    setOrder(s.order);
    setErrorMsg('');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/admin/subjects/${editingId}` : '/api/admin/subjects';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim(),
          isActive,
          order: Number(order)
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save subject');
      }

      setFormOpen(false);
      fetchSubjects();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete subject "${name}" and all its sample papers?`)) return;

    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSubjects();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const toggleStatus = async (s: Subject) => {
    try {
      await fetch(`/api/admin/subjects/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: s.name,
          code: s.code,
          description: s.description,
          isActive: !s.isActive,
          order: s.order
        })
      });
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-heading tracking-tight">
            Class 12 Subject Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Configure Class 12 Commerce curriculum subjects, syllabus order, and student portal visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-4 transition-colors">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
              {editingId ? 'Edit Subject' : 'Add Subject'}
            </h3>

            {errorMsg && (
              <p className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Book Keeping and Accountancy"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g., BK"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] uppercase focus:outline-none focus:border-[#315E9E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Curriculum Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Summary of syllabus topics..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#315E9E] bg-[var(--bg-main)] border-[var(--border-color)]"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-[var(--text-primary)] font-medium">
                  Active (Visible on student portal)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table of Subjects */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#315E9E]" />
            <span>Loading subjects...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Code</th>
                  <th className="py-3.5 px-4 font-semibold">Subject Name</th>
                  <th className="py-3.5 px-4 font-semibold">Sample Papers</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#315E9E] dark:text-[#6D9FE8]">{s.code}</td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{s.name}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {s._count?.samplePapers || 0} papers
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(s)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                          s.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-color)]'
                        }`}
                      >
                        {s.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{s.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
