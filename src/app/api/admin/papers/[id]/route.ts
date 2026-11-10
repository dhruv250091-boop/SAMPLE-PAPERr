import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import { SamplePaperSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const { id } = await params;
  try {
    const paper = await prisma.samplePaper.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ paper });
  } catch (err) {
    console.error('Error fetching paper:', err);
    return NextResponse.json({ error: 'Failed to fetch paper' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const { id } = await params;
  try {
    const body = await req.json();
    const result = SamplePaperSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { subjectId, title, year, description, paperPdfUrl, answerPdfUrl, isPublished } = result.data;

    const updated = await prisma.samplePaper.update({
      where: { id },
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

    await logAdminAction(adminCheck.user.id, 'UPDATE_SAMPLE_PAPER', { id, title: updated.title });
    return NextResponse.json({ paper: updated });
  } catch (err) {
    console.error('Error updating paper:', err);
    return NextResponse.json({ error: 'Failed to update sample paper' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const { id } = await params;
  try {
    const deleted = await prisma.samplePaper.delete({
      where: { id }
    });

    await logAdminAction(adminCheck.user.id, 'DELETE_SAMPLE_PAPER', { id, title: deleted.title });
    return NextResponse.json({ success: true, message: 'Sample paper deleted' });
  } catch (err) {
    console.error('Error deleting paper:', err);
    return NextResponse.json({ error: 'Failed to delete sample paper' }, { status: 400 });
  }
}
