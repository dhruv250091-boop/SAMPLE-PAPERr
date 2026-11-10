'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, CheckCircle2, Calendar, BookOpen, Eye } from 'lucide-react';
import AnswerModal from './AnswerModal';

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
  questions?: Array<{
    id: string;
    questionNumber: string;
    subQuestion?: string | null;
    questionText: string;
    marks?: number | null;
    order: number;
    answers: Array<{
      id: string;
      answerText: string;
      explanation?: string | null;
      order: number;
    }>;
  }>;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function PaperCard({ paper }: { paper: PaperItem }) {
  const [modalOpen, setModalOpen] = useState(false);

  const formattedSize = formatBytes(paper.fileSize);

  return (
    <>
      <div className="p-6 rounded-3xl bg-[#12121A] border border-[#222230] hover:border-purple-500/40 card-hover-3d flex flex-col justify-between shadow-xl">
        <div>
          {/* Header Tag and Year */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono">
              {paper.subject.code}
            </span>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-black tracking-widest font-heading shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>
                {paper.month ? `${paper.month} ` : ''}{paper.year}
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 font-heading">
            {paper.title}
          </h3>

          <p className="mt-2 text-xs text-[#A3A3B5] line-clamp-2 leading-relaxed">
            {paper.description || 'Official Class 12 Commerce examination model question paper with detailed syllabus blueprint.'}
          </p>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#181824] text-[#A3A3B5] border border-[#252535] font-mono">
              <FileText className="w-3 h-3 text-purple-400" />
              <span>{formattedSize ? `PDF (${formattedSize})` : 'PDF Available'}</span>
            </span>

            {paper.answerPdfUrl ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/25 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Solutions</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#181824] text-[#707085] border border-[#252535]">
                <span>Solutions in Review</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3.5 border-t border-[#20202E] flex items-center justify-between gap-2 relative z-20">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Link
              href={`/sample-papers/view/${paper.id}`}
              className="btn-pop inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:bg-red-800 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500/40 cursor-pointer transition-all min-h-[44px]"
              title="Open full interactive PDF viewer"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>View PDF</span>
            </Link>

            <a
              href={`/api/sample-papers/${paper.id}/download`}
              download
              className="btn-pop inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3B5] hover:text-white bg-[#181824] hover:bg-[#20202E] active:bg-[#12121A] border border-[#2A2A3A] hover:border-purple-500/40 transition-colors cursor-pointer min-h-[44px]"
              title="Download PDF directly to your device"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="btn-pop inline-flex items-center space-x-1 text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer min-h-[44px] px-2"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Answers</span>
          </button>
        </div>
      </div>

      {/* Answer Modal */}
      {modalOpen && (
        <AnswerModal
          paper={{
            id: paper.id,
            title: paper.title,
            year: paper.year,
            subject: paper.subject,
            answerPdfUrl: paper.answerPdfUrl,
            paperPdfUrl: paper.paperPdfUrl,
            questions: paper.questions || []
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
