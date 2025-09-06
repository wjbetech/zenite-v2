'use client';

import create from 'zustand';

type ThemeState = {
  daisyTheme: string;
  setDaisyTheme: (name: string) => void;
};

const getInitialTheme = () => {
  try {
    if (typeof window === 'undefined') return 'pastel';
    return localStorage.getItem('zenite.daisy') || 'pastel';
  } catch {
    return 'pastel';
  }
};

const useDaisyThemeStore = create<ThemeState>((set) => ({
  daisyTheme: getInitialTheme(),
  setDaisyTheme: (name: string) => {
    set({ daisyTheme: name });
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zenite.daisy', name);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', name);
      }
    } catch (e) {
      // intentional no-op for environments where storage isn't available
      // keep store state in memory only
      console.warn('daisyThemeStore: persistence/apply failed', e);
    }
  },
}));

export default useDaisyThemeStore;
