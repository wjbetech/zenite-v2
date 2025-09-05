'use client';

import React, { useEffect } from 'react';
import useThemeStore from '../lib/themeStore';

// theme-change is used to make data-theme based selects/buttons toggle DaisyUI themes
// it must run on the client; we'll dynamically import it to avoid SSR issues

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // initialize from class on html or system preference
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    // 1) read stored user preference
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('zenite.theme');
    } catch {
      /* ignore */
    }

    // stored now uses 'light-theme' | 'dark-theme'
    if (stored === 'dark-theme' || stored === 'light-theme') {
      const t = stored === 'dark-theme' ? 'dark' : 'light';
      setTheme(t);
      try {
        // ensure app-level marker is set
        document.documentElement.setAttribute('data-app-theme', stored);
        const dl = localStorage.getItem('zenite.daisy.light');
        const dd = localStorage.getItem('zenite.daisy.dark');
        if (dl) document.documentElement.setAttribute('data-theme', dl);
        else if (dd && t === 'dark') document.documentElement.setAttribute('data-theme', dd);
      } catch {
        /* ignore */
      }
      return;
    }

    // 2) else fall back to any server-rendered html class
    if (html.classList.contains('dark')) {
      setTheme('dark');
      return;
    }

    // 3) final fallback: light (do not auto-apply system preference)
    setTheme('light');
    try {
      const dl = localStorage.getItem('zenite.daisy.light');
      if (dl) document.documentElement.setAttribute('data-theme', dl);
    } catch {
      /* ignore */
    }
  }, [setTheme]);

  useEffect(() => {
    // NOTE: theme-change initialization is temporarily disabled while debugging
    // It may overwrite `data-theme` from other handlers; re-enable only after verifying behavior.
    return;
  }, []);

  useEffect(() => {
    // Debug helper: log who sets data-theme / data-app-theme and observe attribute changes.
    // Useful to detect other scripts (theme-change or third-party) overwriting the theme.
    if (typeof window === 'undefined') return;
    try {
      const win = window as unknown as { __ZENITE_THEME_DEBUG?: boolean };
      if (win.__ZENITE_THEME_DEBUG) return;
      win.__ZENITE_THEME_DEBUG = true;

      const origSetAttr = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function (name: string, value: string) {
        if (name === 'data-theme' || name === 'data-app-theme') {
          try {
            console.debug(
              '[ZENITE-THEME-DEBUG] setAttribute',
              name,
              value,
              '\nstack:',
              new Error().stack?.split('\n').slice(1, 6).join('\n'),
            );
          } catch {
            /* ignore */
          }
        }
        return origSetAttr.apply(this, [name, value]);
      };

      const root = document.documentElement;
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (
            m.type === 'attributes' &&
            (m.attributeName === 'data-theme' || m.attributeName === 'data-app-theme')
          ) {
            try {
              console.debug(
                '[ZENITE-THEME-DEBUG] mutation',
                m.attributeName,
                root.getAttribute(m.attributeName!),
                {
                  dataTheme: root.getAttribute('data-theme'),
                  appTheme: root.getAttribute('data-app-theme'),
                  localStorage: {
                    daisyLight: localStorage.getItem('zenite.daisy.light'),
                    daisyDark: localStorage.getItem('zenite.daisy.dark'),
                    zeniteTheme: localStorage.getItem('zenite.theme'),
                  },
                  time: Date.now(),
                },
              );
            } catch {
              /* ignore */
            }
          }
        }
      });
      mo.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-app-theme'] });

      return () => {
        try {
          Element.prototype.setAttribute = origSetAttr;
        } catch {
          /* ignore */
        }
        try {
          mo.disconnect();
        } catch {
          /* ignore */
        }
        win.__ZENITE_THEME_DEBUG = false;
      };
    } catch {
      /* ignore */
    }
  }, []);

  return <>{children}</>;
}
