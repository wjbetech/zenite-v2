'use client';

import React from 'react';
import Image from 'next/image';
import { useUser, SignOutButton, SignInButton } from '@clerk/nextjs';

export default function ProfileHeader() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="p-4 rounded-md bg-base-100">
        <p className="mb-2">You are not signed in.</p>
        <SignInButton mode="modal">
          <span>
            <button className="btn btn-primary">Sign in</button>
          </span>
        </SignInButton>
      </div>
    );
  }

  const initials = (() => {
    const full = (user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`).trim();
    if (!full) return '';
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  return (
    <div className="flex items-center gap-4 py-4 pr-4 pl-0 bg-base-100 rounded-md">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-white text-xl font-semibold">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={`${user.fullName ?? 'User'} avatar`}
            width={64}
            height={64}
            className="object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div>
        <div className="font-semibold">
          {user.fullName ?? user.primaryEmailAddress?.emailAddress}
        </div>
        <div className="text-sm text-muted-foreground">
          {user.primaryEmailAddress?.emailAddress}
        </div>
      </div>

      <div className="ml-auto">
        <SignOutButton>
          <button className="btn border-on btn-accent cursor-pointer">Sign out</button>
        </SignOutButton>
      </div>
    </div>
  );
}
