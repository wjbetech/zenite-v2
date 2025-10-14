'use client';

import React from 'react';
import useThemeStore from '../lib/themeStore';

const THEMES = ['pastel', 'cupcake', 'nord', 'business', 'dim'] as const;

export default function ThemeDropdown() {
  const daisyTheme = useThemeStore((s) => s.daisyTheme);
  const setDaisyTheme = useThemeStore((s) => s.setDaisyTheme);

  return (
    <div className="dropdown self-center align-middle">
      <label
        tabIndex={0}
        className="btn btn-outline border-2 w-48 justify-between items-center text-sm px-3 h-10 flex mt-1.5 hover:border-2 hover:border-base-content"
        aria-haspopup="listbox"
        aria-expanded={false}
      >
        <span className="capitalize">{daisyTheme}</span>
        <svg
          className="ml-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </label>
      <ul
        tabIndex={0}
        role="listbox"
        aria-label="Theme options"
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56 mt-2"
      >
        {THEMES.map((t) => (
          <li key={t}>
            <button
              role="option"
              aria-selected={daisyTheme === t}
              onClick={() => setDaisyTheme(t)}
              className={`flex items-center justify-between px-3 h-12 w-full text-sm capitalize hover:bg-base-200 rounded`}
            >
              <span>{t}</span>
              {daisyTheme === t && (
                <svg
                  className="h-4 w-4 text-success"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
