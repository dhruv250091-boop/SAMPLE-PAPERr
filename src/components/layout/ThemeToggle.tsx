'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50 flex items-center justify-center ${className}`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-300 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#C5A46D] transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
