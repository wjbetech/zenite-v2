'use client';

import create from 'zustand';

type ThemeState = {
  daisyTheme: string;
  setDaisyTheme: (t: string) => void;
};

const COOKIE_KEY = 'zenite.daisy';
const ALLOWED_THEMES = ['pastel', 'cupcake', 'nord', 'business', 'dim'] as const;
type AllowedTheme = (typeof ALLOWED_THEMES)[number];

function readInitial(): AllowedTheme | null {
  try {
    const fromLs = localStorage.getItem(COOKIE_KEY);
    if (fromLs && (ALLOWED_THEMES as readonly string[]).includes(fromLs))
      return fromLs as AllowedTheme;
    // scrub invalid
    if (fromLs && !(ALLOWED_THEMES as readonly string[]).includes(fromLs)) {
      localStorage.removeItem(COOKIE_KEY);
    }
  } catch {}
  try {
    const match = (document.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(COOKIE_KEY + '='));
    if (match) {
      const v = decodeURIComponent(match.split('=')[1] || '');
      if ((ALLOWED_THEMES as readonly string[]).includes(v)) return v as AllowedTheme;
      // scrub invalid cookie
      document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
    }
  } catch {}
  try {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr && (ALLOWED_THEMES as readonly string[]).includes(attr)) return attr as AllowedTheme;
  } catch {}
  return null;
}

function persist(t: string) {
  if (!(ALLOWED_THEMES as readonly string[]).includes(t)) return; // ignore invalid
  try {
    localStorage.setItem(COOKIE_KEY, t);
  } catch {}
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(t)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
  } catch {}
}

const useThemeStore = create<ThemeState>((set) => {
  const initial = (typeof window !== 'undefined' && readInitial()) || 'cupcake';

  // Ensure document reflects initial theme and initialize theme-change on client
  if (typeof window !== 'undefined') {
    try {
      document.documentElement.setAttribute('data-theme', initial);
    } catch {}
    // initialize theme-change listeners (best-effort dynamic import)
    try {
      import('theme-change')
        .then((m) => {
          try {
            if (typeof m.themeChange === 'function') m.themeChange(false);
          } catch {}
        })
        .catch(() => {});
    } catch {}
  }

  return {
    daisyTheme: 'cupcake',
    setDaisyTheme: (t: string) => {
      const next = (ALLOWED_THEMES as readonly string[]).includes(t) ? t : 'cupcake';
      set(() => ({ daisyTheme: next }));
      try {
        document.documentElement.setAttribute('data-theme', next);
      } catch {}
      persist(next);
    },
  };
});

export default useThemeStore;
export { useThemeStore };
