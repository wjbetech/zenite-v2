'use client';

import React from 'react';
import useThemeStore from '../lib/themeStore';

const THEMES = ['pastel', 'cupcake', 'nord', 'business', 'dim'] as const;

export default function ThemeDropdown() {
  const daisyTheme = useThemeStore((s) => s.daisyTheme);
  const setDaisyTheme = useThemeStore((s) => s.setDaisyTheme);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setDaisyTheme(e.target.value);
  }

  return (
    <select
      aria-label="Theme"
      value={daisyTheme}
      onChange={onChange}
      className="text-sm px-2 py-1 border rounded"
    >
      {THEMES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
