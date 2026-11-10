import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PaperCard from '@/components/sample-papers/PaperCard';
import Link from 'next/link';
import { BookOpen, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      select: { code: true }
    });

    return subjects.flatMap((s) => [
      { subject: s.code.toLowerCase() },
      { subject: s.code.toUpperCase() }
    ]);
  } catch {
    return [
      { subject: 'bk' },
      { subject: 'eco' },
      { subject: 'ocm' },
      { subject: 'sp' },
      { subject: 'eng' }
    ];
  }
}

export async function generateMetadata({ params }: SubjectPageProps) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject).toUpperCase();

  const sub = await prisma.subject.findFirst({
    where: {
      OR: [
        { code: decoded },
        { name: { contains: decoded } }
      ]
    }
  });

  if (!sub) {
    return { title: 'Subject Sample Papers | Class 12 Commerce' };
  }

  return {
    title: `${sub.code} – ${sub.name} Sample Papers (Class 12 Commerce)`,
    description: `Download ${sub.name} Class 12 Commerce board sample papers with verified model answers and marking criteria.`
  };
}

export default async function SubjectSamplePapersPage({ params }: SubjectPageProps) {
  const { subject: subjectParam } = await params;
  const rawParam = decodeURIComponent(subjectParam).toLowerCase().trim();

  let searchCode = rawParam.toUpperCase();
  if (rawParam === 'book-keeping' || rawParam === 'accountancy' || rawParam === 'accounts') {
    searchCode = 'BK';
  } else if (rawParam === 'economics') {
    searchCode = 'ECO';
  } else if (rawParam === 'secretarial-practice') {
    searchCode = 'SP';
  } else if (rawParam === 'english') {
    searchCode = 'ENG';
  } else if (rawParam === 'information-technology') {
    searchCode = 'IT';
  }

  const subject = await prisma.subject.findFirst({
    where: {
      OR: [
        { code: searchCode },
        { name: { contains: rawParam } }
      ]
    },
    include: {
      samplePapers: {
        where: { isPublished: true },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        include: {
          subject: true
        }
      }
    }
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="flex-1 bg-[#09090D] text-white py-6 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/sample-papers"
            className="btn-pop inline-flex items-center space-x-1.5 text-xs font-bold text-[#A3A3B5] hover:text-white transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Sample Papers</span>
          </Link>
        </div>

        {/* Subject Header */}
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#12121A] border border-purple-500/25 shadow-2xl space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono">
              Subject Code: {subject.code}
            </span>
            <span className="text-xs text-[#A3A3B5] font-mono">
              {subject.samplePapers.length} Published Papers
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            {subject.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#A3A3B5] max-w-3xl leading-relaxed">
            {subject.description || 'Comprehensive board sample examination papers with step-by-step marking schemes.'}
          </p>

          <div className="pt-1 sm:pt-2 flex flex-wrap gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#A3A3B5]">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>Syllabus Aligned</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>Full Question Papers</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>Verified Solutions</span>
            </div>
          </div>
        </div>

        {/* Papers List */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading">
              Available {subject.code} Sample Papers
            </h2>
          </div>

          {subject.samplePapers.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-2xl sm:rounded-3xl bg-[#12121A] border border-[#222230] text-center space-y-3">
              <BookOpen className="w-10 h-10 text-[#707085] mx-auto" />
              <h3 className="text-base font-semibold text-white font-heading">
                No sample papers are currently available for this subject.
              </h3>
              <p className="text-xs text-[#A3A3B5] max-w-md mx-auto">
                The administrator has not yet uploaded question papers for {subject.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subject.samplePapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
