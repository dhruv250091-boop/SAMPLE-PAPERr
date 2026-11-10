'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  FileCode,
  Loader2,
  BookOpen
} from 'lucide-react';

interface PaperOption {
  id: string;
  title: string;
  year: number;
  subject: { code: string; name: string };
}

interface QAQuestion {
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
  }>;
}

function AdminQAContent() {
  const searchParams = useSearchParams();
  const initialPaperId = searchParams.get('paperId') || '';

  const [papers, setPapers] = useState<PaperOption[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>(initialPaperId);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Single Question Form
  const [questionNumber, setQuestionNumber] = useState('Q.1');
  const [subQuestion, setSubQuestion] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState<number | ''>(5);
  const [order, setOrder] = useState<number>(1);
  const [answerText, setAnswerText] = useState('');
  const [explanation, setExplanation] = useState('');

  // Bulk Import
  const [jsonInput, setJsonInput] = useState('');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch papers list
  useEffect(() => {
    fetch('/api/admin/papers')
      .then((res) => res.json())
      .then((data) => {
        setPapers(data.papers || []);
        if (data.papers?.length > 0 && !selectedPaperId) {
          setSelectedPaperId(data.papers[0].id);
        }
      });
  }, []);

  // Fetch questions when selected paper changes
  useEffect(() => {
    if (selectedPaperId) {
      loadPaperQuestions(selectedPaperId);
    }
  }, [selectedPaperId]);

  const loadPaperQuestions = async (pId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/papers/${pId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.paper?.questions || []);
        setOrder((data.paper?.questions?.length || 0) + 1);
        setQuestionNumber(`Q.${(data.paper?.questions?.length || 0) + 1}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaperId || !questionNumber || !questionText || !answerText) return;

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/admin/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samplePaperId: selectedPaperId,
          questionNumber: questionNumber.trim(),
          subQuestion: subQuestion.trim() || null,
          questionText: questionText.trim(),
          marks: marks ? Number(marks) : null,
          order: Number(order),
          answerText: answerText.trim(),
          explanation: explanation.trim() || null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save question');
      }

      setFeedbackMsg({ type: 'success', text: 'Question and answer successfully saved!' });

      // Reset form
      setQuestionText('');
      setSubQuestion('');
      setAnswerText('');
      setExplanation('');

      loadPaperQuestions(selectedPaperId);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackMsg({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question and its model answers?')) return;

    try {
      const res = await fetch(`/api/admin/qa?id=${qId}`, { method: 'DELETE' });
      if (res.ok) {
        loadPaperQuestions(selectedPaperId);
      } else {
        alert('Failed to delete question');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleBulkImport = async () => {
    if (!jsonInput.trim()) return;

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const parsedItems = JSON.parse(jsonInput);
      if (!Array.isArray(parsedItems)) {
        throw new Error('JSON input must be an array of question objects.');
      }

      const res = await fetch('/api/admin/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samplePaperId: selectedPaperId,
          items: parsedItems
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Bulk import failed');
      }

      const data = await res.json();
      setFeedbackMsg({ type: 'success', text: `Imported ${data.count} questions and answers successfully!` });
      setBulkModalOpen(false);
      setJsonInput('');
      loadPaperQuestions(selectedPaperId);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackMsg({ type: 'error', text: error.message || 'Invalid JSON syntax' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-heading tracking-tight">
            Question & Answer Repository
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Author structured board questions, multi-part items, mathematical working notes, and verified model answers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBulkModalOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] transition-colors shadow-sm cursor-pointer"
        >
          <FileCode className="w-3.5 h-3.5 text-[#315E9E]" />
          <span>Import Questions (JSON)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : null}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Paper Selector */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center gap-4 transition-colors shadow-sm">
        <label className="text-xs font-semibold text-[var(--text-primary)] shrink-0">
          Target Sample Paper:
        </label>
        <select
          value={selectedPaperId}
          onChange={(e) => setSelectedPaperId(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
        >
          {papers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.subject.code} ({p.year}) — {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Question & Answer */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4 transition-colors">
          <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading flex items-center space-x-2 pb-3 border-b border-[var(--border-color)]">
            <Plus className="w-4 h-4 text-[#315E9E]" />
            <span>Add Question & Verified Answer</span>
          </h2>

          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Question No.
                </label>
                <input
                  type="text"
                  value={questionNumber}
                  onChange={(e) => setQuestionNumber(e.target.value)}
                  placeholder="Q.1"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Sub-question
                </label>
                <input
                  type="text"
                  value={subQuestion}
                  onChange={(e) => setSubQuestion(e.target.value)}
                  placeholder="(A) or Part 2"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="8"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Question Text
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                placeholder="State and explain Henri Fayol's 14 principles of management..."
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                  Verified Model Answer (Markdown, Tables & Math Supported)
                </label>
                <span className="text-[10px] text-[#315E9E] font-medium">Supports Tables & KaTeX</span>
              </div>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={6}
                placeholder="Step 1: Introduction... | Particulars | Amount | ... "
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Evaluation Scheme / Concept Note (Optional)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                placeholder="Allocated marks: 2 marks for definition, 6 marks for principles..."
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#315E9E] hover:bg-[#24487D] text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Saving Question...' : 'Save Question to Paper'}</span>
            </button>
          </form>
        </div>

        {/* Right: Existing Questions in this Paper */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Paper Questions ({questions.length})</span>
            </h2>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#315E9E]" />
                <span>Loading questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-12 text-center">
                No questions authored for this paper yet. Use the form on the left to add questions or import a JSON batch.
              </p>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2 text-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#315E9E] dark:text-[#6D9FE8]">
                        {q.questionNumber} {q.subQuestion ? `(${q.subQuestion})` : ''}
                      </span>
                      {q.marks && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
                          {q.marks} Marks
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-medium text-[var(--text-primary)] line-clamp-2">{q.questionText}</p>

                  {q.answers.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] line-clamp-3">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-0.5">Model Answer:</strong>
                      {q.answers[0].answerText}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bulk JSON Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-4 transition-colors">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-[#315E9E]" />
              <span>Import Questions from JSON</span>
            </h3>

            <p className="text-xs text-[var(--text-secondary)]">
              Paste an array of questions conforming to the schema:
            </p>

            <pre className="p-3 rounded-lg bg-[var(--bg-main)] text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto border border-[var(--border-color)]">
{`[
  {
    "questionNumber": "Q.1",
    "subQuestion": "(A)",
    "questionText": "Define Division of Work.",
    "marks": 2,
    "answerText": "Division of work is the principle of dividing whole work into tasks.",
    "explanation": "Reference: Henri Fayol 14 principles."
  }
]`}
            </pre>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              placeholder="Paste JSON array here..."
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#315E9E]"
            />

            <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={submitting || !jsonInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Importing...' : 'Run Bulk Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQAPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
          Loading Question & Answer Editor...
        </div>
      }
    >
      <AdminQAContent />
    </Suspense>
  );
}
