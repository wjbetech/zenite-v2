'use client';

import Link from 'next/link';
import { Button } from './ui/Button';
import ThemeToggle from './ThemeToggle';
import React from 'react';
import DiamondLogo from './DiamondLogo';

export default function Navbar() {
  return (
    <nav className="flex w-full bg-white dark:bg-slate-900 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 h-[72px]">
      <div className="mx-auto px-4 py-3 flex items-center w-full justify-between">
        {/* Left: logo + links */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400"
          >
            <DiamondLogo className="w-7 h-7 inline-block transform translate-y-0.5" />
            <span>Zenite</span>
          </Link>
        </div>

        {/* Right: auth buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
