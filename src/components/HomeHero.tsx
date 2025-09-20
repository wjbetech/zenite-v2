'use client';
import React from 'react';
import Gem from './Gem';
import Gem3D from './Gem3D';
// ...existing code...
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomeHero() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <section
      className="relative overflow-hidden flex items-center py-8"
      style={{ minHeight: 'calc(100vh - var(--nav-height) - 48px)' }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center grid place-items-center gap-6 sm:gap-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-700 leading-tight tracking-tight">
            Productivity should be
            <span className="ml-2 text-emerald-600">zenful</span>
          </h1>

          <p className="sm:mt-4 text-xl text-gray-600 font-medium">
            A modern, minimal tool for real productivity.
          </p>

          {/* Prefer the 3D WebGL gem when available; fall back to the inline SVG */}
          <div className="w-full hidden sm:flex items-center justify-center py-10">
            <Gem3D size={160} />
            <noscript>
              {/* if JS is disabled, show the static SVG gem */}
              <Gem size={64} />
            </noscript>
          </div>

          {/* Absolutely positioned button so it doesn't move page content when adjusted. */}
          {isSignedIn && (
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 sm:bottom-16">
              <button
                className="btn btn-primary px-4 py-2"
                onClick={() => {
                  router.push('/dashboard');
                }}
              >
                To Dashboard 
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
