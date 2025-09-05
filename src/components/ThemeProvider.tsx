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
      console.log(e);
      /* ignore */
    }

    // Accept both legacy values ("dark-theme" / "light-theme") and the simplified form ('dark'|'light')
    const normalized = (() => {
      if (!stored) return null;
      const s = stored.toLowerCase();
      if (s === 'dark' || s === 'light') return s;
      if (s === 'dark-theme') return 'dark';
      if (s === 'light-theme') return 'light';
      return null;
    })();

    if (normalized === 'dark' || normalized === 'light') {
      // restore any persisted daisyUI theme names (optional values stored separately)
      try {
        const dl = localStorage.getItem('zenite.daisy.light');
        const dd = localStorage.getItem('zenite.daisy.dark');
        // inject persisted values into the zustand store synchronously so setTheme uses them
        try {
          const current = useThemeStore.getState();
          useThemeStore.setState({
            daisyLight: dl ?? current.daisyLight,
            daisyDark: dd ?? current.daisyDark,
          });
        } catch {
          // fall back to directly setting the DOM attribute if store mutation fails
          if (dl) html.setAttribute('data-theme', dl);
          if (dd && normalized === 'dark') html.setAttribute('data-theme', dd);
        }
      } catch {
        /* ignore */
      }
      setTheme(normalized as 'dark' | 'light');
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
