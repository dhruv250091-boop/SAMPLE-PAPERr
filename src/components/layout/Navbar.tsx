'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Code,
  Menu,
  X,
  Shield,
  GraduationCap
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/', icon: GraduationCap },
    { label: 'Sample Papers', href: '/sample-papers', icon: BookOpen },
    { label: 'Developer', href: '/developer', icon: Code }
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090D]/95 backdrop-blur-md border-b border-purple-500/25 shadow-xl shadow-black/80'
          : 'bg-[#09090D] border-b border-purple-500/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group btn-pop">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#09090D] border border-purple-500/40 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-heading">
                  SAMPLE PAPER
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Class 12
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`btn-pop flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-purple-400/40'
                      : 'text-[#A3A3B5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#707085]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#A3A3B5] hover:text-white hover:bg-white/5 focus:outline-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-target"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-[#09090D] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`btn-pop flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold min-h-[44px] ${
                    isActive
                      ? 'text-white bg-[#8B5CF6] shadow-md shadow-purple-900/40'
                      : 'text-[#A3A3B5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
