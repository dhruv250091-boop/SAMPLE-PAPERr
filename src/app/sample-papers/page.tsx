import React from 'react';
import prisma from '@/lib/prisma';
import SamplePapersExplorer from '@/components/sample-papers/SamplePapersExplorer';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Class 12 Commerce Sample Papers – Subject-Wise Vault',
  description:
    'Browse, view, and download Class 12 Commerce board sample question papers with verified model answers.'
};

export default async function SamplePapersPage() {
  const [papers, subjects] = await Promise.all([
    prisma.samplePaper.findMany({
      where: { isPublished: true },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: {
        subject: true
      }
    }),
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, code: true, description: true }
    })
  ]);

  return (
    <div className="flex-1 bg-[#09090D] text-white py-6 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] sm:text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Digital Academic Library • 30 Board Documents</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
            Class 12 Commerce <span className="purple-text-gradient">Sample Paper Repository</span>
          </h1>
        </div>

        {/* Explorer with Subject-Wise Accordions */}
        <SamplePapersExplorer initialPapers={papers} subjects={subjects} />
      </div>
    </div>
  );
}
