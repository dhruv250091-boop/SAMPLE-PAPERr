import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';

export default async function AdminOverviewPage() {
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
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    })
  ]);

  const statCards = [
    {
      label: 'Registered Students',
      value: totalStudents,
      icon: Users,
      color: 'text-[#315E9E] dark:text-[#6D9FE8] bg-[#315E9E]/10 border-[#315E9E]/20'
    },
    {
      label: 'Board Sample Papers',
      value: totalPapers,
      icon: FileText,
      color: 'text-[#C5A46D] bg-[#C5A46D]/15 border-[#C5A46D]/30'
    },
    {
      label: 'Active Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'text-[#315E9E] dark:text-[#6D9FE8] bg-[#315E9E]/10 border-[#315E9E]/20'
    },
    {
      label: 'AI Chat Conversations',
      value: totalConversations,
      icon: MessageSquare,
      color: 'text-[#C5A46D] bg-[#C5A46D]/15 border-[#C5A46D]/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
          Admin Governance Overview
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Live statistics, recent uploads, and system security logs.
        </p>
      </div>

      {/* 1. Real Database Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs flex items-center space-x-4 card-hover-3d"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">{c.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5 font-heading">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. Recent Uploads */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#315E9E] dark:text-[#6D9FE8]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Recent Sample Papers</h2>
            </div>
            <Link
              href="/admin/papers"
              className="text-xs font-semibold text-[#315E9E] dark:text-[#6D9FE8] hover:underline flex items-center space-x-1"
            >
              <span>Manage Papers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPapers.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">No papers uploaded yet.</p>
            ) : (
              recentPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold px-1.5 py-0.5 rounded bg-[#315E9E]/10 text-[#315E9E] dark:text-[#6D9FE8] border border-[#315E9E]/20 text-[10px]">
                        {paper.subject.code}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[240px] sm:max-w-md font-heading">
                        {paper.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-[var(--text-secondary)]">
                      <span>Exam Year {paper.year}</span>
                      <span>•</span>
                      <span>
                        {new Date(paper.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        paper.isPublished
                          ? 'bg-[#C5A46D]/15 text-[#C5A46D] border border-[#C5A46D]/30'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {paper.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Recent Admin Audit Logs */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#C5A46D]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Audit Activity</h2>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">Trail</span>
          </div>

          <div className="space-y-2.5">
            {recentAuditLogs.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">No recent admin actions logged.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    By {log.user?.name || log.user?.email || 'System'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
