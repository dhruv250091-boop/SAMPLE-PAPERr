import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import { findPaperFileOnDisk } from '@/lib/pdf-resolver';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const paper = await prisma.samplePaper.findUnique({
      where: { id },
      include: {
        subject: true,
        importedFiles: true
      }
    });

    if (!paper || !paper.isPublished) {
      return NextResponse.json({ error: 'Sample paper not found' }, { status: 404 });
    }

    const filePath = findPaperFileOnDisk(paper);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Physical PDF file not found in repository.' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    const monthStr = paper.month ? `-${paper.month}` : '';
    const cleanFilename = `Class-12-Commerce-${paper.subject.code}-Sample-Paper${monthStr}-${paper.year}.pdf`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
      }
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ error: 'Unable to download document. Please try again.' }, { status: 500 });
  }
}
