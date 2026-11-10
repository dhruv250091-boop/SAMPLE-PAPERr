'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit2,
  Loader2
} from 'lucide-react';

interface ImportedFileRecord {
  id: string;
  originalFilename: string;
  sourcePath: string;
  fileSize: number;
  fileHash: string;
  subjectCode: string;
  detectedYear: number;
  detectedMonth?: string | null;
  status: string;
  storageUrl?: string | null;
  samplePaperId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  samplePaper?: {
    id: string;
    title: string;
    isPublished: boolean;
    paperPdfUrl: string;
  } | null;
}

interface ImportMetrics {
  totalDiscovered: number;
  totalImported: number;
  totalDuplicates: number;
  totalFailed: number;
  totalReviewNeeded: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function AdminImportManagerPage() {
  const [metrics, setMetrics] = useState<ImportMetrics | null>(null);
  const [files, setFiles] = useState<ImportedFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Editing state
  const [editingFile, setEditingFile] = useState<ImportedFileRecord | null>(null);
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editYear, setEditYear] = useState<number>(2025);
  const [editTitle, setEditTitle] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/importer');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Failed to load importer inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleScanAndImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/importer', {
        method: 'POST'
      });
      if (res.ok) {
        await fetchInventory();
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  const openEditModal = (file: ImportedFileRecord) => {
    setEditingFile(file);
    setEditSubjectCode(file.subjectCode);
    setEditYear(file.detectedYear);
    setEditTitle(file.samplePaper?.title || file.originalFilename.replace('.pdf', ''));
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/importer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: editingFile.id,
          subjectCode: editSubjectCode,
          year: editYear,
          title: editTitle
        })
      });
      if (res.ok) {
        setEditingFile(null);
        await fetchInventory();
      }
    } catch (err) {
      console.error('Failed to update file:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight font-heading">
            Sample Paper Import Manager
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Source Directory: <span className="font-mono text-[#315E9E] dark:text-[#6D9FE8]">F:\WEBSITE FOR STUDIES\Sample papers</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleScanAndImport}
          disabled={importing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white shadow-md shadow-[#315E9E]/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning & Importing...</span>
            </>
          ) : (
            <>
              <FolderUp className="w-4 h-4" />
              <span>Scan & Import Local Folder</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">Discovered Files</p>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1 font-heading">{metrics.totalDiscovered}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <p className="text-[11px] text-[#C5A46D] font-medium">Imported Online</p>
            <p className="text-xl font-bold text-[#C5A46D] mt-1 font-heading">{metrics.totalImported}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <p className="text-[11px] text-amber-500 font-medium">Duplicates</p>
            <p className="text-xl font-bold text-amber-500 mt-1 font-heading">{metrics.totalDuplicates}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <p className="text-[11px] text-[#315E9E] dark:text-[#6D9FE8] font-medium">Awaiting Review</p>
            <p className="text-xl font-bold text-[#315E9E] dark:text-[#6D9FE8] mt-1 font-heading">{metrics.totalReviewNeeded}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <p className="text-[11px] text-rose-500 font-medium">Failed Uploads</p>
            <p className="text-xl font-bold text-rose-500 mt-1 font-heading">{metrics.totalFailed}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <p className="text-[11px] text-[#315E9E] dark:text-[#6D9FE8] font-medium">Storage Usage</p>
            <p className="text-xl font-bold text-[#315E9E] dark:text-[#6D9FE8] mt-1 font-heading">{metrics.totalSizeFormatted}</p>
          </div>
        </div>
      )}

      {/* Discovered / Imported Files Table */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2 font-heading">
            <FileText className="w-4 h-4 text-[#315E9E] dark:text-[#6D9FE8]" />
            <span>Import Inventory & Database Association</span>
          </h2>
          <button
            type="button"
            onClick={fetchInventory}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#315E9E]" />
            <span>Loading file repository...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="p-16 text-center text-xs text-[var(--text-secondary)] space-y-2">
            <FolderUp className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <p className="font-semibold text-[var(--text-primary)]">No files imported yet.</p>
            <p className="text-[var(--text-muted)]">
              Click &quot;Scan &amp; Import Local Folder&quot; above to import all PDF sample papers from your local Windows folder.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Original Filename</th>
                  <th className="py-3 px-4 font-semibold">Year &amp; Month</th>
                  <th className="py-3 px-4 font-semibold">File Size</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#315E9E] dark:text-[#6D9FE8]">{f.subjectCode}</td>
                    <td className="py-3 px-4 font-mono text-[var(--text-primary)] truncate max-w-xs">
                      {f.originalFilename}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">
                      {f.detectedMonth ? `${f.detectedMonth} ` : ''}{f.detectedYear}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                      {formatBytes(f.fileSize)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          f.status === 'IMPORTED'
                            ? 'bg-[#C5A46D]/15 text-[#C5A46D] border border-[#C5A46D]/30'
                            : f.status === 'DUPLICATE'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}
                      >
                        {f.status === 'IMPORTED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{f.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {f.samplePaperId && (
                        <Link
                          href={`/sample-papers/view/${f.samplePaperId}`}
                          className="inline-flex items-center space-x-1 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                          title="Preview in PDF Viewer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditModal(f)}
                        className="inline-flex items-center space-x-1 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#315E9E] hover:bg-[var(--bg-secondary)] cursor-pointer"
                        title="Edit Subject, Year or Title"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2 font-heading">
              <Edit2 className="w-4 h-4 text-[#315E9E] dark:text-[#6D9FE8]" />
              <span>Edit Sample Paper Information</span>
            </h3>

            <p className="text-xs font-mono text-[var(--text-secondary)] truncate">
              File: {editingFile.originalFilename}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Subject Code</label>
                <select
                  value={editSubjectCode}
                  onChange={(e) => setEditSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                >
                  <option value="OCM">OCM</option>
                  <option value="BK">BK</option>
                  <option value="ECO">ECO</option>
                  <option value="SP">SP</option>
                  <option value="ENG">ENG</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Examination Year</label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(Number(e.target.value))}
                  min={2020}
                  max={2035}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Published Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? 'Saving...' : 'Approve & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
