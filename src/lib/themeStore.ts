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
      // keep Tailwind compatibility by keeping the `dark` class
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      // also expose a clearer app-level theme marker for other scripts/styles
      const appTheme = t === 'dark' ? 'dark-theme' : 'light-theme';
      root.setAttribute('data-app-theme', appTheme);
      try {
        // persist a cookie so the server or other tools can read the app-level theme
        document.cookie = `zenite.theme=${appTheme}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {
        // surface cookie failures in dev console
        console.error('themeStore: failed to write theme cookie', e);
      }
    }

    try {
      if (typeof localStorage !== 'undefined')
        localStorage.setItem('zenite.theme', t === 'dark' ? 'dark-theme' : 'light-theme');
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
        // ensure the app-level theme attribute matches
        const appTheme = t === 'dark' ? 'dark-theme' : 'light-theme';
        root.setAttribute('data-app-theme', appTheme);
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
      // expose app theme marker
      root.setAttribute('data-app-theme', next === 'dark' ? 'dark-theme' : 'light-theme');
      try {
        document.cookie = `zenite.theme=${
          next === 'dark' ? 'dark-theme' : 'light-theme'
        }; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {
        console.error('themeStore: failed to write theme cookie (toggle)', e);
      }
    }

    try {
      if (typeof localStorage !== 'undefined')
        localStorage.setItem('zenite.theme', next === 'dark' ? 'dark-theme' : 'light-theme');
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
        // keep app-level marker in sync
        root.setAttribute('data-app-theme', next === 'dark' ? 'dark-theme' : 'light-theme');
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
    // apply the daisy data-theme immediately so the UI updates even if state reads race
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', name);
      }
    } catch {
      /* ignore */
    }
    // always call setTheme to ensure the app-level theme marker is applied/updated
    try {
      try {
        get().setTheme('light');
      } catch (err) {
        console.error('themeStore: failed to set global theme to light', err);
      }
      // setTheme will apply the data-theme based on the updated state.daisyLight, keep logs for debugging
      try {
        if (typeof document !== 'undefined') {
          console.log(
            'setDaisyLight called; current theme:',
            get().theme,
            'data-theme:',
            document.documentElement.getAttribute('data-theme'),
          );
        }
      } catch {
        /* ignore */
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
    // apply the daisy data-theme immediately so the UI updates even if state reads race
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', name);
      }
    } catch {
      /* ignore */
    }
    // always call setTheme to ensure the app-level theme marker is applied/updated
    try {
      try {
        get().setTheme('dark');
      } catch (err) {
        console.error('themeStore: failed to set global theme to dark', err);
      }
      // setTheme will apply the data-theme based on the updated state.daisyDark, keep logs for debugging
      try {
        if (typeof document !== 'undefined') {
          console.log(
            'setDaisyDark called; current theme:',
            get().theme,
            'data-theme:',
            document.documentElement.getAttribute('data-theme'),
          );
        }
      } catch {
        /* ignore */
      }
    } catch (e) {
      console.error('themeStore: failed to apply daisyDark', e);
    }
  },
}));

export default useThemeStore;
