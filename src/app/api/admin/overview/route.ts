import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';
import prisma from '@/lib/prisma';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const [
      totalStudents,
      totalPapers,
      totalSubjects,
      totalConversations,
      recentPapers,
      recentAuditLogs
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.samplePaper.count(),
      prisma.subject.count(),
      prisma.conversation.count(),
      prisma.samplePaper.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { subject: true }
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      })
    ]);

    return NextResponse.json({
      metrics: {
        totalStudents,
        totalPapers,
        totalSubjects,
        totalConversations
      },
      recentPapers,
      recentAuditLogs
    });
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    return NextResponse.json({ error: 'Failed to fetch admin dashboard metrics' }, { status: 500 });
  }
}
