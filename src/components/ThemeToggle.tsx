'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/Button';
import useThemeStore from '../lib/themeStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </Button>
  );
}
