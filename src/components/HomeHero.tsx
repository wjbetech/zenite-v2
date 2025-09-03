'use client';
import React from 'react';
import Gem from './Gem';
import Gem3D from './Gem3D';
import { Button } from './ui/Button';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomeHero() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-136px)] flex items-center py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-700 dark:text-gray-300 leading-tight tracking-tight">
            Productivity should be
            <span className="ml-2 text-emerald-600">zenful</span>
          </h1>

          <p className="mt-4 text-xl text-gray-600 dark:text-white font-medium">
            A modern, minimal productivity tool focused on calm and clarity.
          </p>

          {/* Prefer the 3D WebGL gem when available; fall back to the inline SVG */}
          <div className="w-full flex items-center justify-center">
            <Gem3D size={160} />
            <noscript>
              {/* if JS is disabled, show the static SVG gem */}
              <Gem size={64} />
            </noscript>
          </div>

          {/* Absolutely positioned button so it doesn't move page content when adjusted. */}
          {isSignedIn && (
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-16">
              <Button
                variant="primary"
                className="px-4 py-2"
                onClick={() => {
                  router.push('/dashboard');
                }}
              >
                To Dashboard →
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
