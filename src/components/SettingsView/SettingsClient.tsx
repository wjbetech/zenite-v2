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
    <div className="pt-[124px] px-8 pb-12">
      <h1 className="display-font text-3xl font-semibold tracking-tight mb-6 text-emerald-600">
        Settings
      </h1>

      <div className="space-y-6">
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
