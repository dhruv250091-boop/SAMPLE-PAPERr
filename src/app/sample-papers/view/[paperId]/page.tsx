import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PdfViewer from '@/components/sample-papers/PdfViewer';

interface ViewerPageProps {
  params: Promise<{
    paperId: string;
  }>;
}

export async function generateMetadata({ params }: ViewerPageProps) {
  const { paperId } = await params;
  const paper = await prisma.samplePaper.findUnique({
    where: { id: paperId },
    include: { subject: true }
  });

  if (!paper) {
    return { title: 'PDF Viewer | Class 12 Commerce' };
  }

  return {
    title: `View PDF: ${paper.title} (${paper.year})`,
    description: `Original PDF document viewer for Class 12 Commerce ${paper.subject.name}.`
  };
}

export default async function ViewPaperPage({ params }: ViewerPageProps) {
  const { paperId } = await params;

  const paper = await prisma.samplePaper.findUnique({
    where: { id: paperId },
    include: { subject: true }
  });

  if (!paper || !paper.isPublished) {
    notFound();
  }

  return <PdfViewer paper={paper} />;
}
