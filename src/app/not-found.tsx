'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function NotFound() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center bg-base-100/60 rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2 text-rose-600">Uh oh! That page was not found.</h1>
        <p className="text-lg text-base-content/70 mb-4">That&apos;s not very zenful.</p>
        <p className="text-sm text-base-content/60 mb-6">
          Please use a button below to go back to the home page or to your dashboard!
        </p>
        <div className="flex items-center justify-center gap-3">
          {!isLoaded ? (
            // while Clerk is initializing, render two disabled placeholders to reserve space
            <>
              <button
                type="button"
                aria-hidden="true"
                disabled
                className="btn btn-primary text-primary-content border-2 border-primary-content opacity-50 cursor-not-allowed"
              >
                &nbsp;
              </button>
              <button
                type="button"
                aria-hidden="true"
                disabled
                className="btn btn-accent border-2 border-accent-content text-accent-content opacity-50 cursor-not-allowed"
              >
                &nbsp;
              </button>
            </>
          ) : isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="btn btn-primary text-primary-content border-2 border-primary-content"
              >
                To Dashboard
              </Link>
              <Link
                href="/"
                className="btn btn-accent border-2 border-accent-content text-accent-content"
              >
                Home
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className="btn btn-primary text-primary-content border-2 border-primary-content"
            >
              Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
