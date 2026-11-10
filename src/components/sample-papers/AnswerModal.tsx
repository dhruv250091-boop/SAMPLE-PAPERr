'use client';

import React from 'react';
import { X, CheckCircle2, Download, FileText, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuestionWithAnswers {
  id: string;
  questionNumber: string;
  subQuestion?: string | null;
  questionText: string;
  marks?: number | null;
  order: number;
  answers: {
    id: string;
    answerText: string;
    explanation?: string | null;
    order: number;
  }[];
}

interface PaperData {
  id: string;
  title: string;
  year: number;
  subject: {
    name: string;
    code: string;
  };
  paperPdfUrl: string;
  answerPdfUrl?: string | null;
  questions?: QuestionWithAnswers[];
}

interface AnswerModalProps {
  paper: PaperData | null;
  onClose: () => void;
}

export default function AnswerModal({ paper, onClose }: AnswerModalProps) {
  if (!paper) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0E0E14] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-500/20 bg-[#12121A]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                {paper.subject.code}
              </span>
              <span className="text-xs text-[#A3A3B5] font-mono">Exam Year {paper.year}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 font-heading">{paper.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-[#A3A3B5] hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close answers modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0A0A0F] border-b border-purple-500/20 text-xs">
          <div className="flex items-center space-x-2 text-purple-400 font-medium text-[11px] sm:text-xs">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Official Verified Model Solutions</span>
          </div>
          <div className="flex items-center space-x-2">
            {paper.answerPdfUrl && (
              <a
                href={paper.answerPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold hover:bg-purple-500/25 transition-colors cursor-pointer min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Answer PDF</span>
              </a>
            )}
            <a
              href={paper.paperPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#181824] text-[#A3A3B5] hover:text-white border border-[#2A2A3A] transition-colors cursor-pointer min-h-[38px]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paper PDF</span>
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {!paper.questions || paper.questions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-[#707085] mx-auto" />
              <p className="text-sm text-[#A3A3B5] font-medium">
                Structured interactive Q&A content is currently being digitized by the administrator.
              </p>
              {paper.answerPdfUrl ? (
                <p className="text-xs text-[#707085]">
                  You can review the full official solution in the uploaded Answer PDF.
                </p>
              ) : (
                <p className="text-xs text-[#707085]">
                  Model answer document has not yet been uploaded for this paper.
                </p>
              )}
            </div>
          ) : (
            paper.questions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-[#09090D] border border-purple-500/20 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-400 text-sm font-heading">
                      Question {q.questionNumber}
                    </span>
                    {q.subQuestion && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#181824] text-[#A3A3B5] font-mono border border-[#2A2A3A]">
                        {q.subQuestion}
                      </span>
                    )}
                  </div>
                  {q.marks && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                      {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-white">
                  <p>{q.questionText}</p>
                </div>

                {/* Answers List */}
                <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-3">
                  {q.answers.map((a) => (
                    <div key={a.id} className="space-y-2">
                      <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Model Answer:</span>
                      </div>
                      <div className="prose-study text-[#E2E2EC] bg-[#12121A] p-4 rounded-xl border border-purple-500/20 text-xs sm:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {a.answerText}
                        </ReactMarkdown>
                      </div>

                      {a.explanation && (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                          <span className="font-semibold">Marking Scheme / Concept Note: </span>
                          {a.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-[#12121A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-pop px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] hover:bg-[#A855F7] text-white transition-colors cursor-pointer"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
}
