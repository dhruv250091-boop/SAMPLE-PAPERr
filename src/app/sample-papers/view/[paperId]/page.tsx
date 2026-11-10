import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PdfViewer from '@/components/sample-papers/PdfViewer';

interface ViewerPageProps {
  params: Promise<{
    paperId: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const papers = await prisma.samplePaper.findMany({
      where: { isPublished: true },
      select: { id: true }
    });

    return papers.map((paper) => ({
      paperId: paper.id
    }));
  } catch (err) {
    console.error('generateStaticParams error in paper viewer:', err);
    return [];
  }
}

export async function generateMetadata({ params }: ViewerPageProps) {
  try {
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
  } catch {
    return { title: 'PDF Viewer | Class 12 Commerce' };
  }
}

export default async function ViewPaperPage({ params }: ViewerPageProps) {
  const { paperId } = await params;

  let paper = null;
  try {
    paper = await prisma.samplePaper.findUnique({
      where: { id: paperId },
      include: { subject: true }
    });
  } catch (err) {
    console.error('Error fetching paper for view:', err);
  }

  if (!paper || !paper.isPublished) {
    notFound();
  }

  return <PdfViewer paper={paper} />;
}
