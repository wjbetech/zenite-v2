'use client';

import React, { useEffect } from 'react';
import useDaisyThemeStore from '../lib/daisyThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setDaisyTheme = useDaisyThemeStore((s) => s.setDaisyTheme);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // try cookie first (SSR), then localStorage
    const readCookie = (name: string) => {
      const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
      return m ? decodeURIComponent(m[1]) : null;
    };

    let stored: string | null = null;
    try {
      stored = readCookie('zenite.daisy') || localStorage.getItem('zenite.daisy');
    } catch {
      /* ignore */
    }

    if (stored) {
      setDaisyTheme(stored);
    } else {
      // ensure default 'pastel' applied to document
      try {
        document.documentElement.setAttribute('data-theme', 'pastel');
      } catch {
        /* ignore */
      }
    }
  }, [setDaisyTheme]);

  return <>{children}</>;
}
