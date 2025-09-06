'use client';

// Deprecated shim: re-export the working daisyThemeStore to satisfy any legacy imports.
// Prefer importing from './daisyThemeStore' directly.
import useDaisyThemeStore from './daisyThemeStore';

export const useThemeStore = useDaisyThemeStore;
export default useDaisyThemeStore;
