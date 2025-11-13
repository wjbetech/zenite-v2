'use client';

import React from 'react';
import Gem from './Gem';
import Gem3D from './Gem3D';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export default function HomeHero() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  // Hero spacing is handled by container height (100vh minus navbar) and inner gap utilities.

  // Gem sizing is handled with CSS clamp so it stays proportional across breakpoints.

  return (
    <section className="relative flex flex-col place-content-center min-h-screen max-h-screen w-full items-center text-center overflow-hidden bg-gradient-to-br from-base-300 via-base-300/60 to-base-300/80 text-base-content">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-x-1/3 bottom-0 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full justify-center px-6 sm:px-10 lg:px-16 xl:px-24 text-center">
        <div className="mx-auto flex max-w-6xl w-full flex-col items-center justify-center gap-y-10 xl:max-w-8xl xl:gap-y-14 2xl:max-w-[1400px] 2xl:gap-y-20">
          <div className="flex flex-col items-center justify-center text-center w-full">
            <h1 className="text-4xl font-semibold text-base-content sm:text-6xl xl:text-6xl 2xl:text-7xl mt-4 sm:mt-6 md:mt-8 mb-6 sm:mb-8">
              Productivity should be <span className="text-emerald-600">zenful</span>.
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center justify-center gap-x-4 xl:gap-x-6 xl:mt-4 2xl:mt-6">
              {isSignedIn ? (
                <button
                  className="btn btn-success border-2 border-success-content inline-flex items-center justify-center font-semibold text-success-content shadow-[0_20px_45px_-20px_rgba(16,185,129,0.75)] transition"
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                  aria-label="Go to dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Open Dashboard
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="btn btn-success inline-flex items-center justify-center font-semibold border-2 border-success-content transition px-4 py-2 text-sm xl:px-5 xl:py-2 xl:text-base"
                    aria-label="Get started"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5 ml-2" aria-hidden="true" />
                  </button>
                </SignInButton>
              )}
            </div>

            {/* Info cards moved below the gem on the right column */}
          </div>

          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-0 shadow-[0_30px_120px_-40px_rgba(59,130,246,0.65)] blur-3xl" />
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[40px] bg-base-100/10 backdrop-blur-xl">
              <div className="relative flex h-full w-full flex-col items-center justify-center">
                <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute -bottom-12 left-12 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />

                <div className="relative flex items-center justify-center">
                  <div className="mt-4 xl:mt-12 2xl:mt-20 w-[clamp(150px,20vw,380px)] h-[clamp(150px,20vw,380px)] max-w-[45vw] max-h-[60vh] xl:w-[clamp(190px,18vw,460px)] xl:h-[clamp(190px,18vw,460px)] 2xl:w-[clamp(240px,16vw,560px)] 2xl:h-[clamp(240px,16vw,560px)]">
                    <Gem3D size={140} />
                  </div>
                  <noscript>
                    <Gem size={140} />
                  </noscript>
                </div>
                {/* 

                {/* Moved info cards from the left column to sit below the gem preview */}
                <div className="mt-6 grid gap-6 sm:grid-cols-3 text-center">
                  <div className="rounded-2xl border border-base-300/10 bg-base-200 p-4 text-center">
                    <div className="flex items-center gap-3 text-sm text-center m-auto">
                      <h5 className="font-bold text-center uppercase text-emerald-600 m-auto">
                        Momentum
                      </h5>
                    </div>
                    <div className="mt-3 flex items-end gap-2 m-auto justify-center">
                      <span className="text-3xl font-semibold text-base-content/70">12</span>
                      <span className="pb-1 text-sm text-base-content">day streak</span>
                    </div>
                    <p className="mt-2 text-sm text-base-content">
                      Track your productivity streak.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-base-300/10 bg-base-200 p-4">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <h5 className="uppercase tracking-tight font-bold m-auto">Data integrity</h5>
                    </div>
                    <p className="mt-3  text-base-content text-sm">
                      Clerk auth, SOC2-ready architecture to keep your work private and accessible
                      anywhere.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-base-300/10 bg-base-200 p-4">
                    <p className="uppercase tracking-tight text-emerald-600 font-bold">
                      What people say
                    </p>
                    <p className="mt-3 text-sm text-base-content">
                      “I was so tired of the overwhelming systems in other productivity apps. Zenite
                      made life simple again.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
