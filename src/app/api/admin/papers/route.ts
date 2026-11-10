import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import { SamplePaperSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const papers = await prisma.samplePaper.findMany({
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: {
        subject: true,
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json({ papers });
  } catch (err) {
    console.error('Error fetching admin papers:', err);
    return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const result = SamplePaperSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { subjectId, title, year, description, paperPdfUrl, answerPdfUrl, isPublished } = result.data;

    const paper = await prisma.samplePaper.create({
      data: {
        subjectId,
        title,
        year,
        description,
        paperPdfUrl,
        answerPdfUrl: answerPdfUrl || null,
        isPublished
      },
      include: { subject: true }
    });

    await logAdminAction(adminCheck.user.id, 'CREATE_SAMPLE_PAPER', {
      id: paper.id,
      title: paper.title,
      subject: paper.subject.code
    });

    return NextResponse.json({ paper }, { status: 201 });
  } catch (err) {
    console.error('Error creating paper:', err);
    return NextResponse.json({ error: 'Failed to create sample paper' }, { status: 500 });
  }
}
