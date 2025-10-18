'use client';

import { useCallback } from 'react';

// Return a stable navigate function that prefers Next's client router when
// available and mounted, and falls back to window.location.assign in other
// environments (tests, SSR, or when router isn't mounted). The detection of
// next/navigation is performed at call-time inside the callback to avoid
// hook-rule violations.
export function useNavigate() {
  return useCallback((path: string) => {
    if (typeof window === 'undefined') return;

    // Try a dynamic import of next/navigation. This returns a promise; if
    // the module is present we try to call useRouter().push. If anything
    // fails we fall back to hard navigation immediately.
    import('next/navigation')
      .then((nav) => {
        try {
          if (nav && typeof nav.useRouter === 'function') {
            const router = nav.useRouter();
            router.push(path);
            return;
          }
        } catch {
          // fall back below
        }
        window.location.assign(path);
      })
      .catch(() => {
        window.location.assign(path);
      });
  }, []);
}
