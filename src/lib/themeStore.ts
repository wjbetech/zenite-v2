'use client';

import create from 'zustand';

type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  // daisyUI theme names for light/dark modes
  daisyLight: string;
  daisyDark: string;
  setDaisyLight: (name: string) => void;
  setDaisyDark: (name: string) => void;
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

    // apply daisy theme for the newly-selected theme
    try {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const state = get();
        const daisy = t === 'dark' ? state.daisyDark : state.daisyLight;
        if (daisy) root.setAttribute('data-theme', daisy);
      }
    } catch (e) {
      console.error('themeStore: failed to apply daisy theme', e);
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

    // apply daisy theme for toggled theme
    try {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const state = get();
        const daisy = next === 'dark' ? state.daisyDark : state.daisyLight;
        if (daisy) root.setAttribute('data-theme', daisy);
      }
    } catch (e) {
      console.error('themeStore: failed to apply daisy theme (toggle)', e);
    }
  },

  // defaults for daisyUI themes
  daisyLight: 'cupcake',
  daisyDark: 'business',

  setDaisyLight: (name: string) => {
    set({ daisyLight: name });
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('zenite.daisy.light', name);
    } catch (e) {
      console.error('themeStore: failed to write localStorage (daisyLight)', e);
    }
    // apply immediately and log for debugging
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', name);
        const state = get();
        console.log(
          'setDaisyLight called; current theme:',
          state.theme,
          'data-theme:',
          document.documentElement.getAttribute('data-theme'),
        );
        // if the selected daisy theme is a light choice, ensure global theme is light
        if (state.theme !== 'light') {
          try {
            get().setTheme('light');
          } catch (err) {
            console.error('themeStore: failed to set global theme to light', err);
          }
        }
      }
    } catch (e) {
      console.error('themeStore: failed to apply daisyLight', e);
    }
  },

  setDaisyDark: (name: string) => {
    set({ daisyDark: name });
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('zenite.daisy.dark', name);
    } catch (e) {
      console.error('themeStore: failed to write localStorage (daisyDark)', e);
    }
    // apply immediately and log for debugging
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', name);
        const state = get();
        console.log(
          'setDaisyDark called; current theme:',
          state.theme,
          'data-theme:',
          document.documentElement.getAttribute('data-theme'),
        );
        // if the selected daisy theme is a dark choice, ensure global theme is dark
        if (state.theme !== 'dark') {
          try {
            get().setTheme('dark');
          } catch (err) {
            console.error('themeStore: failed to set global theme to dark', err);
          }
        }
      }
    } catch (e) {
      console.error('themeStore: failed to apply daisyDark', e);
    }
  },
}));

export default useThemeStore;
