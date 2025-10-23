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

  // Keep the layout stable when third-party scroll-lock code sets inline widths.
  // Some UI code sets `data-base-ui-scroll-locked` on <html> and writes inline
  // `width: calc(100vw - ...)` on containers. We clear those inline width constraints
  // so the stable scrollbar-gutter approach in globals.css can work without gaps.
  useEffect(() => {
    const ATTR = 'data-base-ui-scroll-locked';
    const selectors = [
      'html',
      'body',
      '#__next',
      'main',
      '.__next',
      '.app-root',
      '.modal.modal-open',
    ];
    const docEl = typeof document !== 'undefined' ? document.documentElement : null;
    if (!docEl) return;

    const stored = new Map<
      HTMLElement,
      {
        width: string;
        maxWidth: string;
        height: string;
      }
    >();

    function applyLock() {
      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (!el) continue;
          if (!stored.has(el)) {
            stored.set(el, {
              width: el.style.width || '',
              maxWidth: el.style.maxWidth || '',
              height: el.style.height || '',
            });
          }
          // Clear inline width/height constraints. Leave overflow alone so
          // scroll-lock can prevent scrolling. The stable scrollbar-gutter
          // in globals.css prevents the gap.
          el.style.width = '';
          el.style.maxWidth = '';
          el.style.height = '';
        } catch {
          // ignore individual failures
        }
      }
    }

    function restoreAll() {
      for (const [el, vals] of stored.entries()) {
        try {
          el.style.width = vals.width;
          el.style.maxWidth = vals.maxWidth;
          el.style.height = vals.height;
        } catch {}
      }
      stored.clear();
    }

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes' && (m as MutationRecord).attributeName === ATTR) {
          if (docEl.hasAttribute(ATTR)) {
            applyLock();
          } else {
            restoreAll();
          }
          break;
        }
      }
    });

    try {
      mo.observe(docEl, { attributes: true, attributeFilter: [ATTR] });
      // handle case where attribute is already present at mount
      if (docEl.hasAttribute(ATTR)) applyLock();
    } catch {
      // observation may fail in some environments; noop
    }

    return () => {
      try {
        mo.disconnect();
      } catch {}
      try {
        restoreAll();
      } catch {}
    };
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
