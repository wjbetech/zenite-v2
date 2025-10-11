'use client';

import ThemeProvider from './ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';
import assertClerkKeySafe from './clerkKeyGuard';
import React, { useEffect, useState } from 'react';
import AuthRedirect from './AuthRedirect';
import { ToastContainer } from 'react-toastify';

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
  const [toastTheme, setToastTheme] = useState<'light' | 'dark'>(() => 'light');

  // Runtime safety: ensure production/staging builds are not using Clerk test/dev keys.
  // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is replaced at build-time; NEXT_PUBLIC_VERCEL_ENV or NODE_ENV
  // indicate the target environment. If we detect a suspicious key in a production-like env,
  // throw so deployments fail fast and we don't accidentally ship with test keys.
  // Delegate to a small testable helper so unit tests can validate behavior
  // without importing the full Providers (which bundles browser-only deps).
  try {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    const deployEnv = (
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.NEXT_PUBLIC_ENV ||
      process.env.NODE_ENV ||
      ''
    ).toString();
    assertClerkKeySafe(clerkKey.toString(), deployEnv);
  } catch (e) {
    throw e;
  }

  useEffect(() => {
    function readAndMap() {
      try {
        const d = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
        setToastTheme(mapDaisyToToastTheme(d));
      } catch {
        setToastTheme('light');
      }
    }
    readAndMap();
    // observe attribute changes to keep toast theme in sync
    try {
      const docEl = document.documentElement;
      const mo = new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.type === 'attributes' && (m as MutationRecord).attributeName === 'data-theme') {
            readAndMap();
            break;
          }
        }
      });
      mo.observe(docEl, { attributes: true, attributeFilter: ['data-theme'] });
      return () => mo.disconnect();
    } catch {
      return;
    }
  }, []);
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
