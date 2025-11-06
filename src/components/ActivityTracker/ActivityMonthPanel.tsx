'use client';

import React from 'react';
import { weeksForMonth, formatDateISO } from '../../lib/activity-date';
import ActivityDaySquare from './ActivityDaySquare';

export default function ActivityMonthPanel({
  monthDate,
  map,
  activityDetails,
  onShowTooltip,
  onHideTooltip,
}: {
  monthDate: Date;
  map: Record<string, number>;
  activityDetails?: Record<string, string[]>;
  onShowTooltip: (el: HTMLElement, node: React.ReactNode) => void;
  onHideTooltip: () => void;
}) {
  const monthWeeks = weeksForMonth(monthDate);
  let cells = monthWeeks.flat();
  // Trim trailing cells that belong to the following month and have no activity
  // and no activityDetails. This prevents rendering extra empty squares at the
  // end of the month for visual cleanliness.
  for (let i = cells.length - 1; i >= 0; i--) {
    const d = cells[i];
    const inMonth = d.getMonth() === monthDate.getMonth();
    const key = formatDateISO(d);
    const count = map[key] ?? 0;
    const titles = activityDetails?.[key] ?? [];
    if (!inMonth && count === 0 && (!titles || titles.length === 0)) {
      cells = cells.slice(0, i);
      continue;
    }
    // Once we encounter a cell that should remain, stop trimming
    break;
  }
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-none w-max">
      <div className="mb-2 font-semibold text-sm">
        {monthDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-1 w-max">
        {weekdays.map((w, i) => (
          <div key={i} className="text-center w-5">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 w-max pb-4">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === monthDate.getMonth();
          const key = formatDateISO(d);
          const count = map[key] ?? 0;
          const titles = activityDetails?.[key] ?? [];
          return (
            <div key={i} className={`relative ${inMonth ? '' : 'opacity-50'}`}>
              <ActivityDaySquare
                date={d}
                extraClass="w-5 h-5 rounded-sm"
                count={count}
                titles={titles}
                onShowTooltip={onShowTooltip}
                onHideTooltip={onHideTooltip}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
