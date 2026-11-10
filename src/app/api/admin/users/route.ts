import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || undefined;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ];
  }

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { conversations: true }
        }
      }
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { userId, isActive, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent admin from deactivating themselves
    if (userId === adminCheck.user.id && isActive === false) {
      return NextResponse.json({ error: 'You cannot deactivate your own administrator account' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && (role === 'STUDENT' || role === 'ADMIN')) updateData.role = role;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    await logAdminAction(adminCheck.user.id, 'UPDATE_USER_STATUS', {
      targetUserId: userId,
      changes: updateData
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('Error updating user status:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
