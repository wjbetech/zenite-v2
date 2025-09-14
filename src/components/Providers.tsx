'use client';

import ThemeProvider from './ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';
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
