'use client';

import Link from 'next/link';
import Image from 'next/image';
// ...existing code...
// ThemeToggle removed; theme selection is done in Settings via ThemeDropdown
import React from 'react';
import DiamondLogo from './DiamondLogo';
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';

type InitialUserShape = {
  fullName?: string | null;
  imageUrl?: string | null;
  email?: string | null;
};

type Props = {
  initialIsSignedIn?: boolean;
  initialUser?: InitialUserShape;
};

export default function Navbar({ initialIsSignedIn, initialUser }: Props) {
  const { user, isLoaded, isSignedIn } = useUser();
  // In tests or certain mocks, isLoaded/isSignedIn may be undefined. Treat undefined as "loaded"
  // to keep tests and server-seeded rendering predictable.
  const clientIsLoaded = isLoaded === undefined ? true : isLoaded;
  const clientIsSignedIn = isSignedIn === undefined ? !!user : isSignedIn;

  // Effective signed-in state: while Clerk client isn't loaded, prefer the server-seeded value
  const effectiveSignedIn = clientIsLoaded ? clientIsSignedIn : initialIsSignedIn ?? false;

  // Prefer client user, otherwise fall back to server-seeded initialUser
  const effectiveUser = (user as unknown as InitialUserShape) ?? initialUser ?? null;

  // Compute initials fallback for users without an avatar image
  const initials = (() => {
    if (!effectiveUser) return '';
    const full = (effectiveUser.fullName || '').trim();
    if (!full) return '';
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  // Prefer client imageUrl, otherwise use initialUser.imageUrl
  const profileImage =
    (user as unknown as InitialUserShape)?.imageUrl ?? initialUser?.imageUrl ?? null;

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
    <nav
      role="navigation"
      aria-label="Main"
      className="absolute top-0 left-0 right-0 z-50 flex w-full "
      style={{ height: 'var(--nav-height)' }}
    >
      <div className="mx-auto px-4 py-3 flex items-center w-full justify-between">
        {/* Left: logo + links */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl md:text-3xl font-extrabold text-emerald-600"
          >
            <DiamondLogo className="w-7 h-7 inline-block transform translate-y-0.5" />
            <h5 className="display-font text-emerald-600 text-4xl font-semibold">Zenite</h5>
          </Link>
        </div>

        {/* Right: auth buttons + avatar */}
        <div className="flex items-center gap-3">
          {!clientIsLoaded && (
            // reserve space until Clerk client hydrates
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-base-300/30 animate-pulse" />
              <div className="w-24 h-10 rounded-md bg-base-300/30 animate-pulse" />
            </div>
          )}

          {clientIsLoaded && effectiveSignedIn && (
            <div className="flex items-center gap-4 ">
              <div
                className="dropdown dropdown-end"
                ref={menuRef}
                onClick={(e) => {
                  const target = e.target as Node;
                  const ul = menuRef.current?.querySelector('ul');
                  if (ul && ul.contains(target)) return;
                  setOpen(true);
                }}
              >
                <button
                  tabIndex={0}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((s) => !s)}
                  className="flex items-center focus:outline-none rounded-md px-2 py-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-base-300 focus-within:ring-2 focus-within:ring-emerald-300 transition-colors">
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

                    <div className="text-sm">{effectiveUser?.fullName ?? effectiveUser?.email}</div>
                  </div>
                </button>

                <ul
                  tabIndex={0}
                  role="menu"
                  aria-label="Profile menu"
                  className={`menu menu-sm dropdown-content mt-2 p-2 shadow bg-base-200 rounded-box w-48 text-base space-y-1 ${
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
                      className="w-full text-left text-base py-2 px-3"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button role="menuitem" onClick={() => setOpen(false)} className="text-base w-full text-left py-2 px-3">
                      Settings
                    </button>
                  </li>
                </ul>
              </div>

              <SignOutButton>
                <button className="btn border-2 border-warning-content btn-warning text-warning-content cursor-pointer">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          )}

          {clientIsLoaded && !effectiveSignedIn && (
            <>
              <SignInButton mode="modal">
                <span>
                  <button className="btn border-2 border-base-content btn-success cursor-pointer">
                    Login
                  </button>
                </span>
              </SignInButton>
              <SignInButton mode="modal">
                <span>
                  <button className="btn border-2 border-base-content btn-accent cursor-pointer">
                    Sign up
                  </button>
                </span>
              </SignInButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
