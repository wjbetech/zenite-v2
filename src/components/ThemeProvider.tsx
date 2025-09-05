'use client';

import React, { useEffect } from 'react';
import useThemeStore from '../lib/themeStore';

// theme-change is used to make data-theme based selects/buttons toggle DaisyUI themes
// it must run on the client; we'll dynamically import it to avoid SSR issues

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
      console.log(e);
      /* ignore */
    }

    if (stored === 'dark' || stored === 'light') {
      setTheme(stored as 'dark' | 'light');
      // also try to read daisy theme selections
      try {
        const dl = localStorage.getItem('zenite.daisy.light');
        const dd = localStorage.getItem('zenite.daisy.dark');
        if (dl) document.documentElement.setAttribute('data-theme', dl);
        else if (dd && stored === 'dark') document.documentElement.setAttribute('data-theme', dd);
      } catch {
        /* ignore */
      }
      return;
    }

    // 2) else fall back to any server-rendered html class
    if (html.classList.contains('dark')) {
      setTheme('dark');
      return;
    }

    // 3) final fallback: light (do not auto-apply system preference)
    setTheme('light');
    try {
      const dl = localStorage.getItem('zenite.daisy.light');
      if (dl) document.documentElement.setAttribute('data-theme', dl);
    } catch {
      /* ignore */
    }
  }, [setTheme]);

  useEffect(() => {
    // initialize theme-change for DaisyUI controls
    if (typeof window === 'undefined') return;
    (async () => {
      try {
        const mod = await import('theme-change');
        // themeChange(false) is required for React projects
        if (mod && typeof mod.themeChange === 'function') mod.themeChange(false);
      } catch (e) {
        // silently ignore if theme-change isn't installed
      }
    })();
  }, []);

  return <>{children}</>;
}
