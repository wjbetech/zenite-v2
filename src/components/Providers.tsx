'use client';

import ThemeProvider from './ThemeProvider';
import React from 'react';
import AuthRedirect from './AuthRedirect';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthRedirect />
      {children}
    </ThemeProvider>
  );
}
