'use client';

import Link from 'next/link';
import Image from 'next/image';
// ...existing code...
// ThemeToggle removed; theme selection is done in Settings via ThemeDropdown
import React from 'react';
import DiamondLogo from './DiamondLogo';
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user } = useUser();

  // Compute initials fallback for users without an avatar image
  const initials = (() => {
    if (!user) return '';
    const full = (user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`).trim();
    if (!full) return '';
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  // Clerk's User has `imageUrl` per @clerk/nextjs types; prefer that.
  const profileImage = user?.imageUrl ?? null;

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full bg-base-200 backdrop-blur-sm border-b border-accent h-[72px]">
      <div className="mx-auto px-4 py-3 flex items-center w-full justify-between">
        {/* Left: logo + links */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl md:text-3xl font-extrabold text-emerald-600"
          >
            <DiamondLogo className="w-7 h-7 inline-block transform translate-y-0.5" />
            <span className="text-emerald-600">Zenite</span>
          </Link>
        </div>

        {/* Right: auth buttons + avatar */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <div className="flex items-center gap-4 ">
              <div
                className="dropdown dropdown-end"
                ref={menuRef}
                onClick={(e) => {
                  // If the click was inside the dropdown-content (menu items), don't force-open.
                  const target = e.target as Node;
                  const ul = menuRef.current?.querySelector('ul');
                  if (ul && ul.contains(target)) return;
                  // Ensure the menu is open when clicking the container/button area.
                  setOpen(true);
                }}
              >
                <button
                  tabIndex={0}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((s) => !s)}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md px-2 py-1 cursor-pointer hover:bg-base-300 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt={`${user?.fullName ?? 'User'}'s avatar`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover border border-base-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-medium">
                        {initials}
                      </div>
                    )}

                    <div className="text-sm">
                      {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
                    </div>
                  </div>
                </button>

                <ul
                  tabIndex={0}
                  role="menu"
                  aria-label="Profile menu"
                  className={`menu menu-sm dropdown-content mt-2 p-2 shadow bg-base-100 rounded-box w-40 ${
                    open ? 'block' : 'hidden'
                  }`}
                >
                  <li>
                    <button
                      role="menuitem"
                      onClick={async () => {
                        try {
                          const res = await fetch('/profile', { method: 'HEAD' });
                          if (res.ok) {
                            setOpen(false);
                            window.location.assign('/profile');
                          } else {
                            alert('Profile page is not available yet.');
                          }
                        } catch {
                          alert('Profile page is not available yet.');
                        }
                      }}
                      className="w-full text-left"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button role="menuitem" onClick={() => setOpen(false)}>
                      Settings
                    </button>
                  </li>
                </ul>
              </div>

              <SignOutButton>
                <button className="btn border-on btn-accent cursor-pointer">Sign out</button>
              </SignOutButton>
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn border-on btn-ghost cursor-pointer">Login</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn border-on btn-md btn-warning cursor-pointer">Sign up</button>            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
