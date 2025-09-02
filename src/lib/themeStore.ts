'use client';

import create from 'zustand';

type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  // default to light; ThemeProvider will initialize from localStorage or html class on mount
  theme: 'light',

  setTheme: (t: Theme) => {
    // update zustand state
    set({ theme: t });

    // update DOM class and cookie/localStorage
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      try {
        // persist a cookie so the server can render the correct html class
        document.cookie = `zenite.theme=${t}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {
        // surface cookie failures in dev console
        console.error('themeStore: failed to write theme cookie', e);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('zenite.theme', t);
    } catch (e) {
      console.error('themeStore: failed to write localStorage (setTheme)', e);
    }
  },

  toggle: () => {
    const state = get();
    const next: Theme = state.theme === 'dark' ? 'light' : 'dark';

    // update zustand state
    set({ theme: next });

    console.log('theme:', next);
    // update DOM class and cookie/localStorage
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (next === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      try {
        document.cookie = `zenite.theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {
        console.error('themeStore: failed to write theme cookie (toggle)', e);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('zenite.theme', next);
    } catch (e) {
      console.error('themeStore: failed to write localStorage (toggle)', e);
    }
  },
}));

export default useThemeStore;
