'use client';

import React from 'react';
import { formatDateISO } from '../../lib/activity-date';
import {
  colorForCount,
  borderForCount,
  formatTooltipDateFromISO,
} from '../../lib/activity-display';

export default function ActivityDaySquare({
  date,
  extraClass = 'w-5 h-5 rounded-sm',
  count = 0,
  titles = [],
  onShowTooltip,
  onHideTooltip,
}: {
  date: Date;
  extraClass?: string;
  count?: number;
  titles?: string[];
  onShowTooltip: (el: HTMLElement, node: React.ReactNode) => void;
  onHideTooltip: () => void;
}) {
  const todayMid = new Date();
  todayMid.setHours(0, 0, 0, 0);
  if (date > todayMid) {
    return (
      <div
        className={`${extraClass} bg-transparent border-2 border-gray-200 opacity-40`}
        aria-hidden
      />
    );
  }
  const key = formatDateISO(date);
  const color = colorForCount(count);
  const border = borderForCount(count);

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${formatTooltipDateFromISO(key)} ${count} completed`}
        onMouseEnter={(e) => {
          if (!titles.length) return;
          const el = e.currentTarget as HTMLElement;
          onShowTooltip(
            el,
            <div className="w-56 max-w-[60vw] bg-base-100 text-sm text-neutral rounded shadow-lg p-4 border-2 border-neutral/60 ring-1 ring-neutral/10">
              <div className="font-semibold text-xs mb-1">
                {formatTooltipDateFromISO(key)} {count} completed
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
            </div>,
          );
        }}
        onMouseLeave={() => onHideTooltip()}
        onFocus={(e) => {
          if (!titles.length) return;
          const el = e.currentTarget as HTMLElement;
          onShowTooltip(
            el,
            <div className="w-56 max-w-[60vw] bg-base-100 text-sm text-neutral rounded shadow-lg p-4 border-2 border-neutral/60 ring-1 ring-neutral/10">
              <div className="font-semibold text-xs mb-1">
                {formatTooltipDateFromISO(key)} {count} completed
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
            </div>,
          );
        }}
        className={`${extraClass} ${color} ${border} cursor-default`}
      />
      {process.env.NODE_ENV === 'test' && titles.length ? (
        <div data-testid={`activity-titles-${key}`} style={{ display: 'none' }}>
          {titles.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
