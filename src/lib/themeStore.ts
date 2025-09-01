'use client';

import create from 'zustand';

type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  // default to light; ThemeProvider will initialize from localStorage or html class on mount
  theme: 'light',
  setTheme: (t: Theme) => {
    set({ theme: t });
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('zenite.theme', t);
    } catch (e) {
      /* ignore */
    }
  },
  toggle: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (next === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      }
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem('zenite.theme', next);
      } catch (e) {
        /* ignore */
      }
      return { theme: next } as ThemeState;
    }),
}));

export default useThemeStore;
