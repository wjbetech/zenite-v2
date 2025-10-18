'use client';

import React from 'react';
import { formatTooltipDateFromISO } from '../../lib/activity-display';

export default function TooltipContent({
  iso,
  count,
  titles = [],
}: {
  iso: string;
  count: number;
  titles?: string[];
}) {
  return (
    <div className="w-56 max-w-[60vw] bg-base-100 text-sm text-neutral rounded shadow-lg p-4 border-2 border-neutral/60 ring-1 ring-neutral/10">
      <div className="font-semibold text-xs mb-1">
        {formatTooltipDateFromISO(iso)} {count} completed
      </div>
      {titles.length ? (
        <ul className="list-disc pl-4 max-h-40 overflow-auto text-xs text-neutral marker:text-neutral">
          {titles.slice(0, 5).map((t, idx) => (
            <li key={idx} className="truncate">
              {t}
            </li>
          ))}
          {titles.length > 5 && <li className="text-xs">and {titles.length - 5} more…</li>}
        </ul>
      ) : (
        <div className="text-xs">No tasks</div>
      )}
    </div>
  );
}
