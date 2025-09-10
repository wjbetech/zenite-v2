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
  // Prefer the actual applied theme on the document (SSR or early script)
  try {
    const attr = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
    if (attr && (ALLOWED_THEMES as readonly string[]).includes(attr)) return attr as AllowedTheme;
  } catch {}
  // Then cookie
  try {
    const match = (document.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(COOKIE_KEY + '='));
    if (match) {
      const v = decodeURIComponent(match.split('=')[1] || '').toLowerCase();
      if ((ALLOWED_THEMES as readonly string[]).includes(v)) return v as AllowedTheme;
      // scrub invalid cookie
      document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
    }
  } catch {}
  // Then localStorage
  try {
    const fromLs = (localStorage.getItem(COOKIE_KEY) || '').toLowerCase();
    if (fromLs && (ALLOWED_THEMES as readonly string[]).includes(fromLs))
      return fromLs as AllowedTheme;
    if (fromLs && !(ALLOWED_THEMES as readonly string[]).includes(fromLs)) {
      localStorage.removeItem(COOKIE_KEY);
    }
  } catch {}
  return null;
}

function persist(t: string) {
  if (!(ALLOWED_THEMES as readonly string[]).includes(t)) return; // ignore invalid
  try {
    localStorage.setItem(COOKIE_KEY, t.toLowerCase());
  } catch {}
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(t.toLowerCase())}; path=/; max-age=${
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
    // After hydration/early script, sync state with actual attribute to keep dropdown accurate
    queueMicrotask?.(() => {
      try {
        const attr = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
        if (attr && (ALLOWED_THEMES as readonly string[]).includes(attr) && attr !== initial) {
          set({ daisyTheme: attr });
        }
      } catch {}
    });
  }

  return {
    daisyTheme: initial,
    setDaisyTheme: (t: string) => {
      const nextRaw = String(t || '').toLowerCase();
      const next = (ALLOWED_THEMES as readonly string[]).includes(nextRaw) ? nextRaw : 'cupcake';
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
