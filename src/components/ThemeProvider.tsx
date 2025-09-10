'use client';

import React from 'react';

// Minimal provider: theming is driven by SSR + early script + themeStore. No auto overrides.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
