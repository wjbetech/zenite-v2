'use client';

import React, { useEffect } from 'react';
import { themeChange } from 'theme-change';

// Initializes theme-change so elements with `data-set-theme` work.
// The actual theme value and persistence are handled by the theme store.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      themeChange(false);
    } catch {
      // ignore
    }
  }, []);

  return <>{children}</>;
}
