'use client';

import React from 'react';

type Props = {
  value?: 'full' | 'mini';
  onChange?: (v: 'full' | 'mini') => void;
};

export default function TaskViewToggle({ value = 'full', onChange }: Props) {
  return (
    <div className="mb-4 flex items-center gap-3 px-3 py-2 rounded-md bg-base-100">
      <label className="text-sm text-gray-600">View:</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={value === 'full'}
          className={`btn btn-sm min-w-[72px] px-3 ${value === 'full' ? 'btn-active' : ''}`}
          onClick={() => onChange?.('full')}
        >
          Full
        </button>
        <button
          type="button"
          aria-pressed={value === 'mini'}
          className={`btn btn-sm min-w-[72px] px-3 ${value === 'mini' ? 'btn-active' : ''}`}
          onClick={() => onChange?.('mini')}
        >
          Mini
        </button>
      </div>
    </div>
  );
}
