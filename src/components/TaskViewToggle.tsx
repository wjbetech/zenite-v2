'use client';

import React from 'react';
import useSettingsStore from '../lib/settingsStore';

// Map internal terminology: settings.density uses 'full' | 'compact'
// UI presents 'Full' and 'Mini' (mini -> compact)
export default function TaskViewToggle() {
  const density = useSettingsStore((s) => s.density);
  const setDensity = useSettingsStore((s) => s.setDensity);

  const value: 'full' | 'mini' = density === 'compact' ? 'mini' : 'full';

  return (
    <div className="mb-4 flex items-center gap-3 px-3 py-2 rounded-md bg-base-100">
      <label className="text-sm text-gray-600">View:</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={value === 'full'}
          className={`btn btn-sm min-w-[72px] px-3 ${value === 'full' ? 'btn-active' : ''}`}
          onClick={() => setDensity('full')}
        >
          Full
        </button>
        <button
          type="button"
          aria-pressed={value === 'mini'}
          className={`btn btn-sm min-w-[72px] px-3 ${value === 'mini' ? 'btn-active' : ''}`}
          onClick={() => setDensity('compact')}
        >
          Mini
        </button>
      </div>
    </div>
  );
}
