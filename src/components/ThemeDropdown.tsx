'use client';

import React, { useEffect, useState } from 'react';

const THEMES = ['pastel', 'cupcake', 'nord', 'business', 'dim'] as const;

function persistTheme(name: string) {
  try {
    localStorage.setItem('zenite.daisy', name);
  } catch {}
  try {
    document.cookie = `zenite.daisy=${encodeURIComponent(name)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
  } catch {}
}

export default function ThemeDropdown() {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem('zenite.daisy') ||
        document.documentElement.getAttribute('data-theme') ||
        '';
      if (saved) {
        setValue(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const t = e.target.value;
    setValue(t);
    try {
      document.documentElement.setAttribute('data-theme', t);
    } catch {}
    persistTheme(t);
  }

  return (
    <select
      aria-label="Theme"
      value={value}
      onChange={onChange}
      className="text-sm px-2 py-1 border rounded"
    >
      <option value="">Theme</option>
      {THEMES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
