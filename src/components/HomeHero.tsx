import React from 'react';
import Gem from './Gem';
import Gem3D from './Gem3D';
// import Link from 'next/link';

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-136px)] flex items-center justify-center">
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
          <Gem3D size={160} />
          <noscript>
            {/* if JS is disabled, show the static SVG gem */}
            <Gem size={64} />
          </noscript>

          {/* <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
            >
              Get started
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Learn more
            </Link>
          </div> */}
        </div>
      </div>
    </section>
  );
}
