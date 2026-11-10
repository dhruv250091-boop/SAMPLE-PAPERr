import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const SingleQAItemSchema = z.object({
  questionNumber: z.string().min(1),
  subQuestion: z.string().optional().nullable(),
  questionText: z.string().min(2),
  marks: z.number().int().optional().nullable(),
  order: z.number().int().default(0),
  answerText: z.string().min(1),
  explanation: z.string().optional().nullable()
});

const BulkImportSchema = z.object({
  samplePaperId: z.string().min(1),
  items: z.array(SingleQAItemSchema)
});

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const body = await req.json();

    // Check if bulk import or single item
    if (body.items && Array.isArray(body.items)) {
      const parsed = BulkImportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed for bulk QA import', details: parsed.error.format() }, { status: 400 });
      }

      const { samplePaperId, items } = parsed.data;

      // Verify sample paper exists
      const paper = await prisma.samplePaper.findUnique({
        where: { id: samplePaperId }
      });
      if (!paper) {
        return NextResponse.json({ error: 'Sample paper not found' }, { status: 404 });
      }

      // Execute bulk insert in a transaction
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const q = await tx.question.create({
            data: {
              samplePaperId,
              questionNumber: item.questionNumber,
              subQuestion: item.subQuestion || null,
              questionText: item.questionText,
              marks: item.marks || null,
              order: item.order || i + 1
            }
          });

          await tx.answer.create({
            data: {
              questionId: q.id,
              answerText: item.answerText,
              explanation: item.explanation || null,
              order: 1
            }
          });
        }
      });

      await logAdminAction(adminCheck.user.id, 'BULK_IMPORT_QA', {
        samplePaperId,
        count: items.length
      });

      return NextResponse.json({ success: true, count: items.length }, { status: 201 });
    }

    // Single Question & Answer Creation
    const { samplePaperId, questionNumber, subQuestion, questionText, marks, order, answerText, explanation } = body;

    if (!samplePaperId || !questionNumber || !questionText || !answerText) {
      return NextResponse.json({ error: 'Missing required question and answer fields' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        samplePaperId,
        questionNumber,
        subQuestion: subQuestion || null,
        questionText,
        marks: marks ? parseInt(marks, 10) : null,
        order: order ? parseInt(order, 10) : 0,
        answers: {
          create: {
            answerText,
            explanation: explanation || null,
            order: 1
          }
        }
      },
      include: { answers: true }
    });

    await logAdminAction(adminCheck.user.id, 'CREATE_QA', {
      questionId: question.id,
      paperId: samplePaperId
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    console.error('Error saving Q&A:', err);
    return NextResponse.json({ error: 'Failed to save question and answer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const url = new URL(req.url);
  const questionId = url.searchParams.get('id');

  if (!questionId) {
    return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
  }

  try {
    await prisma.question.delete({
      where: { id: questionId }
    });

    await logAdminAction(adminCheck.user.id, 'DELETE_QA', { questionId });
    return NextResponse.json({ success: true, message: 'Question and answer removed' });
  } catch (err) {
    console.error('Error deleting Q&A:', err);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 400 });
  }
}
