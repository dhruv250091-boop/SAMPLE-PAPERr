import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  BookOpen,
  ArrowRight,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Download,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Laptop,
  Eye
} from 'lucide-react';
import ThreeDDeviceShowcase from '@/components/ui/ThreeDDeviceShowcase';

export default async function HomePage() {
  const [subjects, latestPapers, introSetting] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { samplePapers: { where: { isPublished: true } } }
        }
      }
    }),
    prisma.samplePaper.findMany({
      where: { isPublished: true },
      take: 6,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: { subject: true }
    }),
    prisma.appSettings.findUnique({ where: { settingKey: 'website_intro' } })
  ]);

  const introText =
    introSetting?.settingValue ||
    'Explore authentic board sample papers, practice verified model answers, and master Class 12 Commerce curriculum with comprehensive resources.';

  return (
    <div className="flex-1 flex flex-col bg-[#09090D] text-white">
      {/* 1. HERO SECTION WITH 3D SHOWCASE */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-purple-500/20">
        {/* Purple Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] sm:text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Maharashtra State Board • Class 12 Commerce 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] sm:leading-[1.1] font-heading">
              Master Class 12 Commerce <br />
              <span className="purple-text-gradient">With Authentic Board Papers</span>
            </h1>

            {/* HIGH-PRIORITY PROMINENT PRACTICE SAMPLE PAPERS HERO CARD */}
            <div className="pt-2 max-w-2xl mx-auto text-left">
              <Link
                href="/sample-papers"
                className="btn-pop group block p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#161224] to-[#0D0B14] border-2 border-purple-500/40 hover:border-purple-400 shadow-[0_10px_30px_rgba(139,92,246,0.25)] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/60 mt-0.5">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        <span>High Priority Board Resource</span>
                      </div>
                      <h2 className="text-base sm:text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors font-heading flex items-center space-x-1.5">
                        <span>Practice Sample Papers</span>
                        <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </h2>
                      <p className="text-xs text-[#A3A3B5] mt-1 leading-snug">
                        30 authentic Maharashtra Board question papers with complete step-by-step model solutions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Subject Tap Pills */}
                <div className="mt-3.5 pt-3 border-t border-purple-500/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-bold text-[#707085] uppercase tracking-wider mr-1">
                    Direct Subject Access:
                  </span>
                  {[
                    { code: 'BK', name: 'Accountancy' },
                    { code: 'ECO', name: 'Economics' },
                    { code: 'OCM', name: 'Commerce' },
                    { code: 'SP', name: 'Secretarial' },
                    { code: 'ENG', name: 'English' }
                  ].map((sub) => (
                    <span
                      key={sub.code}
                      className="px-2.5 py-1 rounded-lg bg-[#1D162E] hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-mono font-bold transition-colors"
                    >
                      {sub.code}
                    </span>
                  ))}
                </div>
              </Link>
            </div>

            {/* Action Buttons with Pop Animation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/sample-papers"
                className="btn-pop w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#8B5CF6] to-[#581C87] hover:from-[#A855F7] hover:to-[#7C3AED] text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-purple-400/40 cursor-pointer touch-target"
              >
                <BookOpen className="w-4 h-4 text-purple-200" />
                <span>Explore All 30 Sample Papers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3D Interactive Device Showcase (Books, Tablet, and Laptop) */}
          <div className="mt-8 sm:mt-12">
            <ThreeDDeviceShowcase />
          </div>
        </div>
      </section>

      {/* 2. SECTION A: SUBJECT DASHBOARDS */}
      <section className="py-10 sm:py-20 border-b border-purple-500/20 bg-[#07070A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5 sm:mb-2 font-mono">
                ACADEMIC CURRICULUM
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Subject-Wise Sample Paper Vault
              </h2>
            </div>
            <Link
              href="/sample-papers"
              className="btn-pop mt-3 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 py-1"
            >
              <span>View All 30 Papers in Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((sub) => {
              const codeLower = sub.code.toLowerCase();
              return (
                <Link
                  key={sub.id}
                  href={`/sample-papers/${codeLower}`}
                  className="btn-pop group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#101018] border border-[#222230] hover:border-purple-500/50 card-hover-3d flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs font-extrabold tracking-wider px-3 py-1 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono">
                        {sub.code}
                      </span>
                      <span className="text-xs text-[#A3A3B5] font-mono">
                        {sub._count.samplePapers} {sub._count.samplePapers === 1 ? 'Paper' : 'Papers'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-400 transition-colors font-heading">
                      {sub.name}
                    </h3>

                    <p className="mt-1.5 sm:mt-2 text-xs text-[#A3A3B5] line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {sub.description || 'Comprehensive board practice papers, marking criteria, and question solutions.'}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3 border-t border-[#20202E] flex items-center justify-between text-xs font-bold text-[#A3A3B5] group-hover:text-purple-400">
                    <span>Inspect {sub.code} Papers</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SECTION B: LATEST PAPERS SHELF */}
      <section className="py-10 sm:py-20 border-b border-purple-500/20 bg-[#09090D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5 sm:mb-2 font-mono">
                RECENT BOARD EXAMINATIONS
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Latest Authentic Question Papers
              </h2>
            </div>
            <Link
              href="/sample-papers"
              className="btn-pop mt-3 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 py-1"
            >
              <span>Explore All Years</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {latestPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#12121A] border border-[#222230] hover:border-purple-500/40 card-hover-3d flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                      {paper.subject.code}
                    </span>
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-black tracking-widest font-heading shadow-inner">
                      <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{paper.month ? `${paper.month} ` : ''}{paper.year}</span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 font-heading">
                    {paper.title}
                  </h3>

                  <p className="text-xs text-[#A3A3B5] line-clamp-2 leading-relaxed">
                    {paper.description}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#20202E] flex items-center justify-between gap-2 relative z-20">
                  <Link
                    href={`/sample-papers/view/${paper.id}`}
                    className="btn-pop flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500/40 transition-all cursor-pointer min-h-[44px]"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>View PDF</span>
                  </Link>

                  <a
                    href={`/api/sample-papers/${paper.id}/download`}
                    download
                    className="btn-pop p-2.5 rounded-xl bg-[#181824] hover:bg-[#20202E] active:bg-[#12121A] text-[#A3A3B5] hover:text-white border border-[#2A2A3A] hover:border-purple-500/40 transition-colors cursor-pointer inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-purple-400 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION C: COMPREHENSIVE BOARD PREPARATION CALLOUT */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-[#09090D] via-[#130B1C] to-[#09090D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-600 to-purple-950 border border-purple-500/40 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(139,92,246,0.6)]">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight font-heading px-2">
            Prepare for Your Maharashtra Board Examinations
          </h2>

          <p className="text-xs sm:text-base text-[#A3A3B5] max-w-xl mx-auto leading-relaxed px-2">
            Practice authentic previous board question papers, review comprehensive step-by-step model answers, and score top marks in your Class 12 Commerce examinations.
          </p>

          <div className="pt-2 sm:pt-4">
            <Link
              href="/sample-papers"
              className="btn-pop w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#581C87] hover:from-[#A855F7] hover:to-[#7C3AED] text-white font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(139,92,246,0.6)] border border-purple-400/50 cursor-pointer touch-target"
            >
              <BookOpen className="w-4 h-4" />
              <span>Access All Sample Papers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
