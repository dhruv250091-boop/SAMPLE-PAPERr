import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/security';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Settings,
  Shield,
  ArrowLeft,
  FolderSync
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex-1 bg-[var(--bg-main)] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-surface)] border border-rose-500/30 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading">Access Restricted</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your account ({user.email}) does not have administrative privileges. This dashboard is restricted to website administrators.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#315E9E] hover:bg-[#24487D] text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  const navTabs = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { label: 'Sample Papers', href: '/admin/papers', icon: FileText },
    { label: 'Paper Import', href: '/admin/sample-paper-import', icon: FolderSync },
    { label: 'Questions & Answers', href: '/admin/qa', icon: HelpCircle },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col md:flex-row min-h-[calc(100vh-4rem)] transition-colors">
      {/* Admin Sidebar Navigation: Midnight Navy Theme */}
      <aside className="w-full md:w-64 bg-[#101B2D] border-r border-white/10 shrink-0 p-4 space-y-6 text-white">
        <div className="px-3 py-2 border-b border-white/10">
          <div className="flex items-center space-x-2 text-[#C5A46D] font-bold text-sm font-heading">
            <Shield className="w-4 h-4" />
            <span>Admin Governance</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {user.name || user.email}
          </p>
        </div>

        <nav className="space-y-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 px-3">
          Role-Based Access Active
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--bg-main)]">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
