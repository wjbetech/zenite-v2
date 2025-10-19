import React from 'react';
import Spinner from './Spinner';

export default function DataLoading({
  label = 'Loading…',
  variant = 'accent',
}: {
  label?: string;
  variant?: 'primary' | 'success' | 'accent' | 'muted';
}) {
  return (
    <div className="col-span-full min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Spinner variant={variant} />
        <div className="mt-3 text-sm text-base-content/50">{label}</div>
      </div>
    </div>
  );
}
