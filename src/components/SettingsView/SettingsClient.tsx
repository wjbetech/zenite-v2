'use client';

import React from 'react';

type SettingItem = {
  id: string;
  title: string;
  description?: string;
  // render can be a React node (component instance) for that setting
  render?: React.ReactNode;
};

type SettingsClientProps = {
  sections?: SettingItem[];
};

export default function SettingsClient({ sections = [] }: SettingsClientProps) {
  return (
    // place the scrollable area below the fixed navbar by offsetting with marginTop
    // and constraining height to the available viewport below the nav. The header
    // is made sticky so it remains visible while the options list scrolls.
    <div
      className="px-8 pb-12 flex flex-col"
      style={{
        marginTop: 'var(--nav-height)',
        height: 'calc(100vh - var(--nav-height))',
      }}
    >
      {/* Header stays at the top; the inner options area below is the only scrollable element. */}
      <div className="z-10 px-0 pt-6 pb-4 -mx-8 bg-base-100/80 backdrop-blur-sm">
        <div className="px-8">
          <h1 className="display-font text-3xl font-semibold tracking-tight text-emerald-600">
            Settings
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-6 pr-4">
        {sections.map((s) => (
          <section key={s.id} className="bg-base-200 p-4 rounded-md">
            {/* grid with an auto-width column for controls so the control can be centered
                  vertically relative to the left text block even when the text wraps */}
            <div className="grid items-center grid-cols-[1fr_auto] gap-4">
              <div className="self-start">
                <h2 className="text-lg font-medium">{s.title}</h2>
                {s.description && (
                  <p className="text-sm text-base-content/60 mt-1">{s.description}</p>
                )}
              </div>
              <div className="ml-4 flex items-center justify-end">{s.render}</div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
