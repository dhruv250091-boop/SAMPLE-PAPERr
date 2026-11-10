import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-purple-500/20 bg-[#07070A] text-[#A3A3B5] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-purple-950/40">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-base font-heading tracking-wider">SAMPLE PAPER</span>
            </div>
            <p className="text-xs text-[#A3A3B5] leading-relaxed">
              Dedicated academic preparation platform for Class 12 Commerce students. Board sample papers, verified model solutions, and examination practice archives.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-purple-400">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Strictly Class 12 Commerce Curriculum</span>
            </div>
          </div>

          {/* Academic Sections */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-heading">
              Academic Library
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sample-papers" className="hover:text-purple-400 transition-colors">
                  All Sample Papers
                </Link>
              </li>
              <li>
                <Link href="/sample-papers/ocm" className="hover:text-purple-400 transition-colors">
                  Organization of Commerce (OCM)
                </Link>
              </li>
              <li>
                <Link href="/sample-papers/bk" className="hover:text-purple-400 transition-colors">
                  Book Keeping & Accountancy (BK)
                </Link>
              </li>
              <li>
                <Link href="/sample-papers/eco" className="hover:text-purple-400 transition-colors">
                  Economics Sample Papers
                </Link>
              </li>
              <li>
                <Link href="/sample-papers/sp" className="hover:text-purple-400 transition-colors">
                  Secretarial Practice (SP)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-heading">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-purple-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sample-papers" className="hover:text-purple-400 transition-colors">
                  Sample Papers
                </Link>
              </li>
              <li>
                <Link href="/developer" className="hover:text-purple-400 transition-colors">
                  Developer – Dhruv Chokshi
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-purple-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-heading">
              Legal & Verification
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-[#707085] block pt-2">
                  Exclusively focused on Class 12 Commerce curriculum (Maharashtra State Board).
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-8 mt-8 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#707085]">
          <p>© {new Date().getFullYear()} Class 12 Commerce Sample Papers. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1.5">
            <span>Architected & Built by</span>
            <Link
              href="/developer"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Dhruv Chokshi (Class 12 Commerce)
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
