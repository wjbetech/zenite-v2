'use client';

import create from 'zustand';

type ThemeState = {
  daisyTheme: string;
  setDaisyTheme: (t: string) => void;
};

const COOKIE_KEY = 'zenite.daisy';

function readInitial(): string | null {
  try {
    const fromLs = localStorage.getItem(COOKIE_KEY);
    if (fromLs) return fromLs;
  } catch {}
  try {
    const match = (document.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(COOKIE_KEY + '='));
    if (match) return decodeURIComponent(match.split('=')[1] || '');
  } catch {}
  try {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
  } catch {}
  return null;
}

function persist(t: string) {
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
  const initial = (typeof window !== 'undefined' && readInitial()) || 'pastel';

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
    daisyTheme: initial,
    setDaisyTheme: (t: string) => {
      set(() => ({ daisyTheme: t }));
      try {
        document.documentElement.setAttribute('data-theme', t);
      } catch {}
      persist(t);
    },
  };
});

export default useThemeStore;
export { useThemeStore };
