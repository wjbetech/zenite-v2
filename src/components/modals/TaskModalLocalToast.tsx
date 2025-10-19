'use client';

import React from 'react';

export default function TaskModalLocalToast({
  toast,
}: {
  toast: { type: 'error' | 'success'; message: string } | null;
}) {
  if (!toast) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div
        className={`px-4 py-2 rounded shadow-lg text-sm ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}
