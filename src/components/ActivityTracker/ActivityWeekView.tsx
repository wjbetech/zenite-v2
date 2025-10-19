'use client';

import React from 'react';
import { addDays, formatDateISO } from '../../lib/activity-date';
import ActivityDaySquare from './ActivityDaySquare';

export default function ActivityWeekView({
  endDate,
  map,
  activityDetails,
  onShowTooltip,
  onHideTooltip,
}: {
  endDate: Date;
  map: Record<string, number>;
  activityDetails?: Record<string, string[]>;
  onShowTooltip: (el: HTMLElement, node: React.ReactNode) => void;
  onHideTooltip: () => void;
}) {
  const start = addDays(endDate, -6);
  const dates: Date[] = [];
  for (let cur = new Date(start); cur <= endDate; cur = addDays(cur, 1)) dates.push(new Date(cur));
  return (
    <div className="flex-none w-max">
      <div className="mb-2 font-semibold text-sm">This Week</div>
      <div className="flex gap-2 items-center mb-2">
        {dates.map((d, i) => (
          <div key={i} className="text-xs text-gray-500 w-8 text-center">
            {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pb-4">
        {dates.map((d, i) => {
          const key = formatDateISO(d);
          const count = map[key] ?? 0;
          const titles = activityDetails?.[key] ?? [];
          return (
            <div key={i} className="relative">
              <ActivityDaySquare
                date={d}
                extraClass="w-8 h-8 rounded"
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
