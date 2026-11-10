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

    if (!paper) {
      return NextResponse.json({ error: 'Sample paper not found' }, { status: 404 });
    }

    const filePath = findPaperFileOnDisk(paper);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Physical PDF document could not be located in repository.' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${paper.originalFilename || 'paper.pdf'}"`,
        'Content-Length': stats.size.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
      }
    });
  } catch (err) {
    console.error('File stream error:', err);
    return NextResponse.json({ error: 'Failed to read document' }, { status: 500 });
  }
}
