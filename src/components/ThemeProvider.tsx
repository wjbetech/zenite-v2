'use client';

import React, { useEffect } from 'react';
import useThemeStore from '../lib/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // initialize from class on html or system preference
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    // 1) read stored user preference
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('zenite.theme');
    } catch (e) {
      /* ignore */
    }

    if (stored === 'dark' || stored === 'light') {
      setTheme(stored as 'dark' | 'light');
      return;
    }

    // 2) else fall back to any server-rendered html class
    if (html.classList.contains('dark')) {
      setTheme('dark');
      return;
    }

    // 3) final fallback: light (do not auto-apply system preference)
    setTheme('light');
  }, [setTheme]);

  return <>{children}</>;
}
