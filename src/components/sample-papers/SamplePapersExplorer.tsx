'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  Eye,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

interface PaperItem {
  id: string;
  title: string;
  year: number;
  month?: string | null;
  fileSize?: number | null;
  description?: string | null;
  paperPdfUrl: string;
  answerPdfUrl?: string | null;
  createdAt: Date | string;
  subject: {
    name: string;
    code: string;
  };
}

interface SamplePapersExplorerProps {
  initialPapers: PaperItem[];
  subjects: SubjectItem[];
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SamplePapersExplorer({
  initialPapers,
  subjects
}: SamplePapersExplorerProps) {
  const [search, setSearch] = useState('');
  // Expanded subject code (default: 'BK' or first subject)
  const [expandedSubject, setExpandedSubject] = useState<string | null>('BK');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');

  // Group papers by subject code
  const papersBySubject = useMemo(() => {
    const map = new Map<string, PaperItem[]>();
    for (const sub of subjects) {
      map.set(sub.code.toUpperCase(), []);
    }

    for (const p of initialPapers) {
      const code = p.subject.code.toUpperCase();
      if (!map.has(code)) {
        map.set(code, []);
      }
      map.get(code)!.push(p);
    }

    // Sort papers within each subject by year desc, then month
    map.forEach((list) => {
      list.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return (a.month || '').localeCompare(b.month || '');
      });
    });

    return map;
  }, [initialPapers, subjects]);

  const toggleSubject = (code: string) => {
    setExpandedSubject((prev) => (prev === code ? null : code));
  };

  // Filter within papers
  const matchesSearch = (p: PaperItem) => {
    if (selectedYearFilter !== 'ALL' && p.year !== parseInt(selectedYearFilter, 10)) {
      return false;
    }
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.subject.name.toLowerCase().includes(query) ||
      p.subject.code.toLowerCase().includes(query) ||
      (p.month && p.month.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  };

  return (
    <div className="space-y-8">
      {/* Search and Year Filter Bar */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card border border-purple-500/25 shadow-xl space-y-4">
        {/* Quick Subject Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setExpandedSubject('ALL_OPEN')}
            className={`btn-pop px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 border transition-all ${
              expandedSubject === 'ALL_OPEN'
                ? 'bg-[#8B5CF6] text-white border-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-[#14141E] text-[#A3A3B5] border-[#222230] hover:text-white'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => {
            const isSelected = expandedSubject === sub.code.toUpperCase();
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setExpandedSubject(sub.code.toUpperCase())}
                className={`btn-pop px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-[#8B5CF6] text-white border-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                    : 'bg-[#14141E] text-[#A3A3B5] border-[#222230] hover:text-white hover:border-purple-500/30'
                }`}
              >
                {sub.code}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707085]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topic, paper title, or year (e.g. 2026, July)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#09090D] border border-purple-500/20 text-xs sm:text-sm text-white placeholder:text-[#707085] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-purple-600 transition-colors"
            />
          </div>

          {/* Quick Year Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#A3A3B5] shrink-0 font-medium hidden sm:inline">Exam Year:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', '2026', '2025', '2024'].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYearFilter(yr)}
                  className={`btn-pop px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    selectedYearFilter === yr
                      ? 'bg-[#8B5CF6] text-white border-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                      : 'bg-[#14141E] text-[#A3A3B5] border-[#222230] hover:text-white hover:border-purple-500/30'
                  }`}
                >
                  {yr === 'ALL' ? 'All Years' : yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info stats */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#A3A3B5] pt-3 border-t border-[#20202E]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>
              Subject Folders: <strong className="text-white">{subjects.length} Subjects</strong> • Papers:{' '}
              <strong className="text-white">{initialPapers.length} Documents</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              type="button"
              onClick={() => setExpandedSubject('ALL_OPEN')}
              className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer py-1"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setExpandedSubject(null)}
              className="text-[#707085] hover:text-white hover:underline cursor-pointer py-1"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* SUBJECTS ACCORDION LIST */}
      <div className="space-y-5">
        {subjects.map((sub) => {
          const code = sub.code.toUpperCase();
          const allSubjectPapers = papersBySubject.get(code) || [];
          const filteredSubjectPapers = allSubjectPapers.filter(matchesSearch);
          const isExpanded = expandedSubject === code || expandedSubject === 'ALL_OPEN';

          return (
            <div
              key={sub.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'bg-gradient-to-b from-[#141420] to-[#0E0E16] border-purple-500/40 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.9),0_0_20px_rgba(139,92,246,0.18)]'
                  : 'bg-[#12121A]/80 border-[#222230] hover:border-purple-500/30'
              }`}
            >
              {/* Subject Clickable Header Bar */}
              <button
                type="button"
                onClick={() => toggleSubject(code)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer btn-pop"
              >
                <div className="flex items-center space-x-4">
                  {/* Subject Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base border transition-all ${
                      isExpanded
                        ? 'bg-[#8B5CF6] text-white border-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]'
                        : 'bg-[#181824] text-purple-400 border-purple-500/20'
                    }`}
                  >
                    {sub.code}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                        {sub.name}
                      </h3>
                      <span className="hidden sm:inline text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                        {allSubjectPapers.length} Papers
                      </span>
                    </div>
                    <p className="text-xs text-[#A3A3B5] mt-1 line-clamp-1 max-w-xl">
                      {sub.description || 'Full curriculum syllabus board question papers with solutions.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs text-[#707085] hidden md:inline">
                    {isExpanded ? 'Click to collapse' : 'Click to view papers'}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                      isExpanded
                        ? 'bg-purple-500/20 text-purple-400 rotate-180'
                        : 'bg-[#181824] text-[#A3A3B5]'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Collapsible Papers Shelf */}
              {isExpanded && (
                <div className="p-5 sm:p-6 pt-2 border-t border-purple-500/20 space-y-4 bg-[#09090D]/60 animate-in fade-in slide-in-from-top-3 duration-200">
                  {filteredSubjectPapers.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#707085] space-y-1">
                      <Layers className="w-8 h-8 text-[#707085] mx-auto mb-2" />
                      <p>No sample papers match your current year or search filters for {sub.name}.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSubjectPapers.map((paper) => {
                        const formattedSize = formatBytes(paper.fileSize);

                        return (
                          <div
                            key={paper.id}
                            className="p-5 rounded-2xl bg-[#12121A] border border-[#222230] hover:border-purple-500/40 card-hover-3d flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2">
                              {/* Session and Year Badge */}
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-black tracking-widest font-heading shadow-inner">
                                  <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span>
                                    {paper.month ? `${paper.month} ` : ''}{paper.year}
                                  </span>
                                </span>

                                <span className="text-[10px] font-mono text-[#707085]">
                                  {formattedSize || 'PDF'}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 font-heading">
                                {paper.title}
                              </h4>

                              <p className="text-[11px] text-[#A3A3B5] line-clamp-2 leading-relaxed">
                                {paper.description}
                              </p>
                            </div>

                            {/* Action Buttons with Pop Animation */}
                            <div className="pt-3 border-t border-[#20202E] flex items-center justify-between gap-2 relative z-20">
                              <Link
                                href={`/sample-papers/view/${paper.id}`}
                                className="btn-pop flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500/40 cursor-pointer transition-all min-h-[44px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="w-3.5 h-3.5 shrink-0" />
                                <span>View PDF</span>
                              </Link>

                              <a
                                href={`/api/sample-papers/${paper.id}/download`}
                                download
                                className="btn-pop p-2.5 rounded-xl bg-[#181824] hover:bg-[#20202E] active:bg-[#12121A] text-[#A3A3B5] hover:text-white border border-[#2A2A3A] hover:border-purple-500/40 transition-all cursor-pointer inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
                                title="Download Original PDF"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="w-4 h-4 text-purple-400 shrink-0" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
