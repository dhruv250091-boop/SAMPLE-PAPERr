'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored preference
    const stored = localStorage.getItem('commerce_theme') as Theme | null;
    const initialTheme: Theme = stored || 'system';
    setThemeState(initialTheme);

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved: ResolvedTheme =
      initialTheme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : initialTheme;

    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);

    // System theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentStored = localStorage.getItem('commerce_theme') as Theme | null;
      if (!currentStored || currentStored === 'system') {
        const nextResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(nextResolved);
        applyTheme(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const applyTheme = (target: ResolvedTheme) => {
    const root = document.documentElement;
    if (target === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('commerce_theme', newTheme);

    let nextResolved: ResolvedTheme;
    if (newTheme === 'system') {
      nextResolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      nextResolved = newTheme;
    }

    setResolvedTheme(nextResolved);
    applyTheme(nextResolved);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
