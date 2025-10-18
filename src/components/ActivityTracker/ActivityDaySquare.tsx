'use client';

import React from 'react';
import { formatDateISO } from '../../lib/activity-date';
import {
  colorForCount,
  borderForCount,
  formatTooltipDateFromISO,
} from '../../lib/activity-display';
import TooltipContent from './TooltipContent';

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
          onShowTooltip(el, <TooltipContent iso={key} count={count} titles={titles} />);
        }}
        onMouseLeave={() => onHideTooltip()}
        onFocus={(e) => {
          if (!titles.length) return;
          const el = e.currentTarget as HTMLElement;
          onShowTooltip(el, <TooltipContent iso={key} count={count} titles={titles} />);
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
