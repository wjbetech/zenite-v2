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

  return (
    <section className="relative flex min-h-screen w-full items-center text-center overflow-hidden bg-gradient-to-br from-base-300 via-base-300/60 to-base-300/80 text-base-content py-20">
      <div className="pointer-events-none absolute inset-0 py-10">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-x-1/3 bottom-0 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-24 sm:px-10 lg:px-16 xl:px-24 text-center">
        <div className="flex flex-col items-center gap-16 text-center">
          <div className="flex flex-col items-center justify-center space-y-20 m-auto text-center w-full">
            <h1 className="text-4xl font-semibold text-base-content sm:text-6xl">
              Productivity should be <span className="text-emerald-600">zenful</span>.
            </h1>
            <div className="flex flex-col pb-10 sm:flex-row sm:items-center sm:justify-center justify-center">
              {isSignedIn ? (
                <button
                  className="btn btn-success border-2 border-base-content inline-flex items-center justify-center font-semibold text-base-content shadow-[0_20px_45px_-20px_rgba(16,185,129,0.75)] transition"
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
                    className="btn btn-success inline-flex items-center justify-center font-semibold border-2 border-base-content transition"
                    aria-label="Get started"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </SignInButton>
              )}
            </div>

            {/* Info cards moved below the gem on the right column */}
          </div>

          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-0 shadow-[0_30px_120px_-40px_rgba(59,130,246,0.65)] blur-3xl" />
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[40px] bg-base-100/10 p-10 backdrop-blur-xl">
              <div className="relative flex h-full w-full flex-col items-center justify-center">
                <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute -bottom-12 left-12 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />

                <div className="relative flex items-center justify-center py-20">
                  <Gem3D size={200} />
                  <noscript>
                    <Gem size={120} />
                  </noscript>
                </div>
                {/* 
                <div className="mt-8 w-full rounded-2xl border border-base-100/10 bg-base-100/20 p-5 text-base-content">
                  <p className="uppercase tracking-[0.28em] text-base-content">Live Status</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] text-slate-400">Today</p>
                      <p className="text-sm text-white">
                        Focus blocks · Inbox zero · 2 projects updated
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Upcoming</p>
                      <p className="text-sm text-white">
                        Retro session · Strategy weekly · Launch checklist
                      </p>
                    </div>
                  </div>
                </div> */}
                {/* Moved info cards from the left column to sit below the gem preview */}
                <div className="mt-6 grid gap-6 sm:grid-cols-3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <h5 className="uppercase tracking-tight font-bold m-auto">Data integrity</h5>
                    </div>
                    <p className="mt-3  text-base-content text-sm">
                      Clerk auth, SOC2-ready architecture to keep your work private and accessible
                      anywhere.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
