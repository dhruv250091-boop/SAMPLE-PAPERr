import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import { SubjectSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { samplePapers: true }
        }
      }
    });
    return NextResponse.json({ subjects });
  } catch (err) {
    console.error('Admin subjects get error:', err);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const result = SubjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { name, code, description, isActive, order } = result.data;

    // Check duplicate
    const existing = await prisma.subject.findFirst({
      where: {
        OR: [{ code: code.toUpperCase() }, { name }]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'A subject with this name or code already exists' }, { status: 409 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        isActive,
        order
      }
    });

    await logAdminAction(adminCheck.user.id, 'CREATE_SUBJECT', { code: subject.code, name: subject.name });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (err) {
    console.error('Error creating subject:', err);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
