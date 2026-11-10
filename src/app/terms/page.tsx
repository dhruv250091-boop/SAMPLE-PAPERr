import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions | Class 12 Commerce Study Platform'
};

export default function TermsPage() {
  return (
    <div className="flex-1 bg-[var(--bg-main)] py-16 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#315E9E]/10 dark:bg-[#315E9E]/20 border border-[#315E9E]/25 text-[#315E9E] dark:text-[#6D9FE8] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Guidelines</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">Terms and Conditions</h1>
          <p className="text-xs text-[var(--text-secondary)]">Class 12 Commerce Educational Platform</p>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 shadow-sm space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">1. Academic Purpose</h2>
            <p>
              This website is dedicated solely to Class 12 Commerce educational preparation. Sample question papers and model answers are intended for study, practice, and syllabus revision.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">2. Platform Usage & Guidelines</h2>
            <p>
              Users agree to utilize this platform solely for academic learning and curriculum inquiry. Automated scraping, malicious injection, or unauthorized distribution is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">3. Intellectual Property</h2>
            <p>
              Model answers and educational analyses are authored to aid secondary school commerce candidates in mastering official board patterns and scoring rubrics.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
