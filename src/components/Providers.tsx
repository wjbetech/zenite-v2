'use client';

import ThemeProvider from './ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import AuthRedirect from './AuthRedirect';
import { ToastContainer } from 'react-toastify';
import useThemeStore from '../lib/themeStore';

// Map DaisyUI themes to react-toastify theme prop
function mapDaisyToToastTheme(d?: string | null) {
  const light = new Set(['cupcake', 'nord', 'pastel']);
  const dark = new Set(['dim', 'business']);
  const normalized = (d || '').toLowerCase();
  if (light.has(normalized)) return 'light' as const;
  if (dark.has(normalized)) return 'dark' as const;
  return 'light' as const;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const daisy = useThemeStore((s) => s.daisyTheme);
  const toastTheme = mapDaisyToToastTheme(daisy);
  return (
    <ClerkProvider>
      <ThemeProvider>
        <AuthRedirect />
        {children}
        <ToastContainer
          position="top-center"
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          limit={1}
          theme={toastTheme}
        />
      </ThemeProvider>
    </ClerkProvider>
  );
}
