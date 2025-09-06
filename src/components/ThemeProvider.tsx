'use client';

import React, { useEffect } from 'react';
import { themeChange } from 'theme-change';

// Lightweight provider that initializes the theme-change library on the client.
// theme-change wires up elements with `data-set-theme` to change `data-theme` on
// the document. We also ensure a sensible default (pastel) if nothing is stored.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // initialize theme-change (false = don't watch for auto changes)
    try {
      themeChange(false);
    } catch {
      // ignore if initialization fails
    }

    // read cookie first (SSR), then localStorage, otherwise default to pastel
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

    try {
      document.documentElement.setAttribute('data-theme', stored ?? 'pastel');
    } catch {
      /* ignore */
    }
  }, []);

  return <>{children}</>;
}
