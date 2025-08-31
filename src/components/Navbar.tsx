'use client';

import Link from 'next/link';
import { Button } from './ui/Button';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="flex w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 h-[72px]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center w-full justify-between">
        {/* Left: logo + links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-extrabold text-indigo-600">
            Zenite
          </Link>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <Link href="/tasks" className="hover:text-gray-900">
              Tasks
            </Link>
            <Link href="/about" className="hover:text-gray-900">
              About
            </Link>
          </div>
        </div>

        {/* Right: auth buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary">Sign up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
