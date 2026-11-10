import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Class 12 Commerce Study Platform'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 bg-[var(--bg-main)] py-16 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#315E9E]/10 dark:bg-[#315E9E]/20 border border-[#315E9E]/25 text-[#315E9E] dark:text-[#6D9FE8] text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Privacy</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">Privacy Policy</h1>
          <p className="text-xs text-[var(--text-secondary)]">Effective: Class 12 Commerce Academic Cycle 2026</p>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 shadow-sm space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">1. Information We Collect</h2>
            <p>
              When you sign in using your account, we collect only your basic profile information (display name, email address) necessary to authenticate you and preserve your personalized study preferences. We never receive or store your third-party credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">2. Academic Study Data</h2>
            <p>
              Academic resources, question views, and downloaded sample papers are accessed securely through authenticated server-side endpoints to support Class 12 Commerce curriculum preparation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">3. Security and Storage</h2>
            <p>
              All data communications use SSL/TLS encryption. Database queries utilize parameterized Prisma ORM operations to prevent injection attacks, and administrative access is protected with strict server-side role verification.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
