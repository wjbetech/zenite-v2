'use client';
import React from 'react';
import Gem from './Gem';
import Gem3D from './Gem3D';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

export default function HomeHero() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <section
      className="relative overflow-hidden flex items-center py-2 bg-base-100"
      style={{ minHeight: 'calc(100vh - var(--nav-height))' }}
    >
      <div className="container mx-auto px-6 lg:px-12 h-full">
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-between items-center text-center gap-6 py-12">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-700 leading-tight tracking-tight">
              Productivity should be
              <span className="ml-2 text-emerald-600">zenful</span>.
            </h1>

            {/* Prefer the 3D WebGL gem when available; fall back to the inline SVG */}
            <div className="w-full flex items-center justify-center py-10">
              <Gem3D size={160} />
              <noscript>
                {/* if JS is disabled, show the static SVG gem */}
                <Gem size={64} />
              </noscript>
            </div>

            <p className="text-xl text-gray-600 font-medium max-w-2xl">
              A modern, minimal tool for real productivity.
            </p>
          </div>

          <div className="m-auto mt-6">
            {isSignedIn ? (
              <button
                className="btn btn-accent border-on px-4 py-2 inline-flex items-center gap-2"
                onClick={() => {
                  router.push('/dashboard');
                }}
                aria-label="Go to dashboard"
              >
                <LayoutDashboard size={16} aria-hidden="true" />
                <span>To Dashboard</span>
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="btn btn-accent border-on px-4 py-2 inline-flex items-center gap-2"
                  aria-label="Get started"
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
