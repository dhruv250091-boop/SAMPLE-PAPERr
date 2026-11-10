'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

interface PaperItem {
  id: string;
  title: string;
  year: number;
  description?: string | null;
  paperPdfUrl: string;
  answerPdfUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
  subject: SubjectItem;
  _count?: { questions: number };
}

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number>(2025);
  const [description, setDescription] = useState('');
  const [paperPdfUrl, setPaperPdfUrl] = useState('');
  const [answerPdfUrl, setAnswerPdfUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Upload file state
  const [uploadingPaper, setUploadingPaper] = useState(false);
  const [uploadingAnswer, setUploadingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [papersRes, subjectsRes] = await Promise.all([
        fetch('/api/admin/papers'),
        fetch('/api/admin/subjects')
      ]);

      if (papersRes.ok) {
        const pData = await papersRes.json();
        setPapers(pData.papers || []);
      }
      if (subjectsRes.ok) {
        const sData = await subjectsRes.json();
        setSubjects(sData.subjects || []);
        if (sData.subjects?.length > 0 && !subjectId) {
          setSubjectId(sData.subjects[0].id);
        }
      }
    } catch {
      setErrorMsg('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setYear(2025);
    setDescription('');
    setPaperPdfUrl('');
    setAnswerPdfUrl('');
    setIsPublished(true);
    setErrorMsg('');
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    setFormOpen(true);
  };

  const openEdit = (p: PaperItem) => {
    setEditingId(p.id);
    setSubjectId(p.subject.id);
    setTitle(p.title);
    setYear(p.year);
    setDescription(p.description || '');
    setPaperPdfUrl(p.paperPdfUrl);
    setAnswerPdfUrl(p.answerPdfUrl || '');
    setIsPublished(p.isPublished);
    setErrorMsg('');
    setFormOpen(true);
  };

  // Upload handler with server-side validation
  const handleFileUpload = async (file: File, type: 'paper' | 'answer') => {
    if (type === 'paper') setUploadingPaper(true);
    else setUploadingAnswer(true);

    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      if (type === 'paper') {
        setPaperPdfUrl(data.url);
      } else {
        setAnswerPdfUrl(data.url);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message);
    } finally {
      if (type === 'paper') setUploadingPaper(false);
      else setUploadingAnswer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !paperPdfUrl.trim() || !subjectId) {
      setErrorMsg('Please provide Title, Subject, and Question Paper PDF');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/admin/papers/${editingId}` : '/api/admin/papers';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          title: title.trim(),
          year: Number(year),
          description: description.trim(),
          paperPdfUrl: paperPdfUrl.trim(),
          answerPdfUrl: answerPdfUrl.trim() || null,
          isPublished
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save sample paper');
      }

      setFormOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, pTitle: string) => {
    if (!confirm(`Delete sample paper "${pTitle}"? All associated questions will be removed.`)) return;

    try {
      const res = await fetch(`/api/admin/papers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete paper');
      }
    } catch {
      alert('Network error');
    }
  };

  const togglePublish = async (p: PaperItem) => {
    try {
      await fetch(`/api/admin/papers/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: p.subject.id,
          title: p.title,
          year: p.year,
          description: p.description,
          paperPdfUrl: p.paperPdfUrl,
          answerPdfUrl: p.answerPdfUrl,
          isPublished: !p.isPublished
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-heading tracking-tight">
            Sample Paper Library
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage official Question Papers and Answer Keys across Class 12 Commerce subjects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Paper</span>
        </button>
      </div>

      {/* Upload/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-4 my-8 transition-colors">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
              {editingId ? 'Edit Sample Paper' : 'Upload New Sample Paper'}
            </h3>

            {errorMsg && (
              <p className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Class 12 Commerce Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Examination Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={2020}
                    max={2035}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Paper Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., OCM Board Model Sample Paper – 2025"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Description / Syllabus Topics
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Overview of paper pattern and marking criteria..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              {/* 1. PDF File Upload for Question Paper */}
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  1. Original Question Paper PDF (Required)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'paper');
                    }}
                    className="text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#315E9E] file:text-white hover:file:bg-[#24487D] cursor-pointer"
                  />
                  {uploadingPaper && (
                    <span className="text-xs text-[#315E9E] flex items-center space-x-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating & Uploading PDF...</span>
                    </span>
                  )}
                </div>
                {paperPdfUrl && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                    Uploaded: {paperPdfUrl}
                  </p>
                )}
              </div>

              {/* 2. PDF File Upload for Answer Key */}
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  2. Answer Document / Model Solutions PDF (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'answer');
                    }}
                    className="text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  {uploadingAnswer && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating Answer PDF...</span>
                    </span>
                  )}
                </div>
                {answerPdfUrl && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                    Uploaded: {answerPdfUrl}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#315E9E] bg-[var(--bg-main)] border-[var(--border-color)]"
                />
                <label htmlFor="isPublishedCheck" className="text-xs text-[var(--text-primary)] font-medium">
                  Publish to Student Library immediately
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
                  disabled={submitting || uploadingPaper || uploadingAnswer}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submitting ? 'Saving Paper...' : 'Save Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Papers Table */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#315E9E]" />
            <span>Loading sample papers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Subject</th>
                  <th className="py-3.5 px-4 font-semibold">Year</th>
                  <th className="py-3.5 px-4 font-semibold">Title</th>
                  <th className="py-3.5 px-4 font-semibold">Documents</th>
                  <th className="py-3.5 px-4 font-semibold">Questions</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {papers.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#315E9E] dark:text-[#6D9FE8]">{p.subject.code}</td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{p.year}</td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)] max-w-xs truncate">{p.title}</td>
                    <td className="py-3 px-4 space-x-2">
                      <a
                        href={p.paperPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-[var(--text-secondary)] hover:text-[#315E9E]"
                        title="Question Paper PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#315E9E]" />
                        <span>Paper</span>
                      </a>
                      {p.answerPdfUrl && (
                        <a
                          href={p.answerPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                          title="Answer Key PDF"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Answers</span>
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      <Link
                        href={`/admin/qa?paperId=${p.id}`}
                        className="text-[#315E9E] dark:text-[#6D9FE8] hover:underline font-mono"
                      >
                        {p._count?.questions || 0} Q&As
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => togglePublish(p)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                          p.isPublished
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
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
