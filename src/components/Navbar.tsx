'use client';

import Link from 'next/link';
import { Button } from './ui/Button';
// ThemeToggle removed; theme selection is done in Settings via ThemeDropdown
import React from 'react';
import DiamondLogo from './DiamondLogo';
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full bg-base-200 backdrop-blur-sm border-b border-gray-200 h-[72px]">
      <div className="mx-auto px-4 py-3 flex items-center w-full justify-between">
        {/* Left: logo + links */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl md:text-3xl font-extrabold text-emerald-600"
          >
            <DiamondLogo className="w-7 h-7 inline-block transform translate-y-0.5" />
            <span>Zenite</span>
          </Link>
        </div>

        {/* Right: auth buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <div className="text-sm">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
            </div>
            <SignOutButton>
              <Button variant="ghost">Sign out</Button>
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Login</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button variant="primary">Sign up</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
