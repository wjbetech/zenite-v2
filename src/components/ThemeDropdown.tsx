'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import useThemeStore from '../lib/themeStore';

const LIGHT_THEMES = ['pastel', 'cupcake', 'nord'];
const DARK_THEMES = ['business', 'dim'];

export default function ThemeDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const setDaisyLight = useThemeStore((s) => s.setDaisyLight);
  const setDaisyDark = useThemeStore((s) => s.setDaisyDark);
  const [appliedTheme, setAppliedTheme] = useState<string | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // observe html[data-theme] changes so the dropdown always shows the single applied theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setAppliedTheme(root.getAttribute('data-theme'));
    update();
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === 'attributes' &&
          (m.attributeName === 'data-theme' || m.attributeName === 'class')
        ) {
          update();
          break;
        }
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        onClick={() => setOpen((s) => !s)}
        variant="ghost"
        className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md shadow-sm min-w-[10rem]"
      >
        <span className="capitalize">{appliedTheme ?? 'Themes'}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">▾</span>
      </Button>

      {open && (
        <div className="absolute left-0 md:right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-xl z-40 ring-1 ring-black/5 dark:ring-white/5">
          <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700">
            Light Themes
          </div>
          <div className="py-1">
            {LIGHT_THEMES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setDaisyLight(t);
                  setAppliedTheme(t);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${
                  appliedTheme === t
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700" />

          <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700">
            Dark Themes
          </div>
          <div className="py-1">
            {DARK_THEMES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setDaisyDark(t);
                  setAppliedTheme(t);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${
                  appliedTheme === t
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
