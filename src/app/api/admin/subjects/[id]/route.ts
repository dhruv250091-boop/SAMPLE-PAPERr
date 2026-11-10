import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import { SubjectSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const { id } = await params;
  try {
    const body = await req.json();
    const result = SubjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { name, code, description, isActive, order } = result.data;

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code: code.toUpperCase(),
        description,
        isActive,
        order
      }
    });

    await logAdminAction(adminCheck.user.id, 'UPDATE_SUBJECT', { id, code: updated.code });
    return NextResponse.json({ subject: updated });
  } catch (err: unknown) {
    console.error('Error updating subject:', err);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const { id } = await params;
  try {
    const deleted = await prisma.subject.delete({
      where: { id }
    });

    await logAdminAction(adminCheck.user.id, 'DELETE_SUBJECT', { id, code: deleted.code });
    return NextResponse.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 400 });
  }
}
