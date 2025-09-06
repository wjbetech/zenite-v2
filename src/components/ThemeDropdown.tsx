'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import useDaisyThemeStore from '../lib/daisyThemeStore';

const THEMES = ['pastel', 'cupcake', 'nord', 'business', 'dim'] as const;

export default function ThemeDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const setDaisyTheme = useDaisyThemeStore((s) => s.setDaisyTheme);
  const current = useDaisyThemeStore((s) => s.daisyTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        onClick={() => setOpen((s) => !s)}
        variant="ghost"
        className="inline-flex items-center gap-2 px-3 py-1 border bg-white rounded-md shadow-sm min-w-[10rem]"
      >
        <span className="capitalize">{mounted ? current ?? 'Themes' : 'Themes'}</span>
        <span className="text-xs text-gray-500">▾</span>
      </Button>

      {open && (
        <div className="absolute left-0 md:right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-40">
          <div className="py-1">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (typeof document !== 'undefined')
                    document.documentElement.setAttribute('data-theme', t);
                  setDaisyTheme(t);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                  current === t ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-700'
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
