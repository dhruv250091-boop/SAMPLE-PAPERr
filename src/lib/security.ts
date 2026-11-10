import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import prisma from './prisma';
import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  image?: string | null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return null;
    }
    const user = session.user as AuthenticatedUser;
    // Verify user is active in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, image: true }
    });

    if (!dbUser || !dbUser.isActive) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email || '',
      name: dbUser.name,
      role: dbUser.role,
      image: dbUser.image
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

export async function requireAuth(): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized access. Please sign in to continue.' },
      { status: 401 }
    );
  }
  return { user };
}

export async function requireAdmin(): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden. Administrator privileges required.' },
      { status: 403 }
    );
  }
  return { user };
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') // Strip HTML tags
    .trim();
}

export async function logAdminAction(
  userId: string,
  action: string,
  details?: Record<string, unknown> | string,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details || {}),
        ipAddress: ipAddress || 'internal'
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
