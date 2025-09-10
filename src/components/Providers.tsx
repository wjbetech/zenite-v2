'use client';

import ThemeProvider from './ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import AuthRedirect from './AuthRedirect';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <AuthRedirect />
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
