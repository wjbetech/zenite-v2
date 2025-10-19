import React from 'react';

import type { RangeKey } from '../../lib/activity-date';

export default function RangeSelector({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (r: RangeKey) => void;
}) {
  const opts: { key: RangeKey; label: string }[] = [
    { key: '3m', label: '3 Months' },
    { key: '1m', label: '1 Month' },
    { key: '1w', label: '1 Week' },
  ];

  return (
    <div className="flex rounded-md gap-3">
      {opts.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`btn btn-accent btn-sm border-2 border-base-content ${
            value === opt.key ? '' : 'opacity-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
