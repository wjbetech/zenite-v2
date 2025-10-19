import React from 'react';
import Spinner from './Spinner';

export default function DataLoading({
  label = 'Loading…',
  variant = 'accent',
  compact = false,
}: {
  label?: string;
  variant?: 'primary' | 'success' | 'accent' | 'muted';
  compact?: boolean;
}) {
  const outerClass = compact
    ? 'w-full flex items-center justify-center'
    : 'col-span-full min-h-[60vh] flex items-center justify-center';

  return (
    <div className={outerClass}>
      <div className="flex flex-col items-center">
        <Spinner variant={variant} />
        <div className="mt-3 text-sm text-base-content/50">{label}</div>
      </div>
    </div>
  );
}
