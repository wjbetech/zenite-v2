'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type RangeKey = '3m' | '1m' | '1w';
export type ActivityMap = Record<string, number>; // yyyy-mm-dd -> count

const ACTIVITY_COOKIE_KEY = 'zenite.activityOpen';
const ACTIVITY_RANGE_KEY = 'zenite.activityRange';

function readCookie(key: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (!m) return null;
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

function writeCookie(key: string, value: string) {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${key}=${encodeURIComponent(
      value,
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function readActivityOpenFromCookie(): boolean | null {
  const v = readCookie(ACTIVITY_COOKIE_KEY);
  if (v === null) return null;
  return v === '1';
}

function writeActivityOpenToCookie(open: boolean) {
  writeCookie(ACTIVITY_COOKIE_KEY, open ? '1' : '0');
}

function readActivityRangeFromCookie(): RangeKey | null {
  const v = readCookie(ACTIVITY_RANGE_KEY);
  if (!v) return null;
  if (v === '3m' || v === '1m' || v === '1w') return v as RangeKey;
  return null;
}

function writeActivityRangeToCookie(range: RangeKey) {
  writeCookie(ACTIVITY_RANGE_KEY, range);
}

function formatDateISO(d: Date) {
  // Return a local YYYY-MM-DD string using local date components to avoid
  // UTC shifts when formatting date-only buckets.
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function startOfWeek(d: Date) {
  const n = new Date(d);
  const day = n.getDay(); // 0 = Sunday
  n.setDate(n.getDate() - day);
  n.setHours(0, 0, 0, 0);
  return n;
}

function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 0, 0, 0, 0);
}

function weeksForMonth(monthDate: Date) {
  // returns an array of weeks; each week is array of 7 Date objects starting Sunday
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const start = startOfWeek(first);
  const finish = endOfWeek(last);
  const weeks: Date[][] = [];
  let cur = new Date(start);
  while (cur <= finish) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function zeroMap(start: Date, end: Date): ActivityMap {
  const map: ActivityMap = {};
  for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
    map[formatDateISO(cur)] = 0;
  }
  return map;
}

function colorForCount(count: number) {
  if (!count) return 'bg-transparent';
  const colors = [
    'bg-success/20',
    'bg-success/30',
    'bg-success/40',
    'bg-success/50',
    'bg-success/60',
    'bg-success/70',
  ];
  const idx = Math.min(Math.max(count, 1), colors.length) - 1;
  return colors[idx];
}

function borderForCount(count: number) {
  if (!count) return 'border-2 border-gray-400';
  const borders = [
    'border-2 border-emerald-100',
    'border-2 border-emerald-200',
    'border-2 border-emerald-300',
    'border-2 border-emerald-400',
    'border-2 border-emerald-500',
    'border-2 border-emerald-600',
  ];
  const idx = Math.min(Math.max(count, 1), borders.length) - 1;
  return borders[idx];
}

function getOrdinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatTooltipDateFromISO(iso: string) {
  try {
    // If the incoming string is a date-only `YYYY-MM-DD`, construct a
    // local Date using numeric components to avoid the ECMAScript behavior
    // where `new Date('YYYY-MM-DD')` is parsed as UTC and can display the
    // previous day in locales west of UTC. For full ISO timestamps keep
    // the normal parsing so timezone-aware times are respected.
    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, day] = iso.split('-').map((s) => parseInt(s, 10));
      // monthIndex is zero-based
      d = new Date(y, m - 1, day, 0, 0, 0, 0);
    } else {
      d = new Date(iso);
    }
    const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
    const monthAbbrev = d.toLocaleDateString(undefined, { month: 'short' });
    const month = monthAbbrev.endsWith('.') ? monthAbbrev : `${monthAbbrev}.`;
    const day = d.getDate();
    const ord = getOrdinal(day);
    return `${weekday}, ${month} ${day}${ord}:`;
  } catch {
    return iso;
  }
}

export default function ActivityHeatmap({
  activity,
  activityDetails,
  startRange = '3m',
  onOpenChange,
  open: openProp,
}: {
  activity?: ActivityMap;
  activityDetails?: Record<string, string[]>;
  startRange?: RangeKey;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  // Controlled/uncontrolled pattern: if openProp is provided, component is controlled.
  const isControlled = typeof openProp === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(() => {
    if (isControlled) return !!openProp;
    const cookieVal = readActivityOpenFromCookie();
    return cookieVal !== null ? cookieVal : false;
  });
  const effectiveOpen = isControlled ? !!openProp : uncontrolledOpen;

  const [range, setRange] = useState<RangeKey>(() => {
    const r = readActivityRangeFromCookie();
    return (r as RangeKey) ?? startRange;
  });

  // compute date range and days depending on range selection
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);

    if (range === '1w') {
      const start = addDays(end, -6);
      const allDays: Date[] = [];
      for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1))
        allDays.push(new Date(cur));
      return { startDate: start, endDate: end, days: allDays };
    }

    if (range === '1m') {
      const monthStart = startOfMonth(end);
      const monthEnd = endOfMonth(end);
      const start = startOfWeek(monthStart);
      const finish = endOfWeek(monthEnd);
      const allDays: Date[] = [];
      for (let cur = new Date(start); cur <= finish; cur = addDays(cur, 1))
        allDays.push(new Date(cur));
      // do not include future days beyond `end`
      const filtered = allDays.filter((d) => d <= end);
      const clampedEnd = finish > end ? end : finish;
      return { startDate: start, endDate: clampedEnd, days: filtered };
    }

    // 3 months view: calendar-aligned last 3 months panels
    const months: Date[] = [];
    for (let i = 2; i >= 0; i--) {
      months.push(new Date(end.getFullYear(), end.getMonth() - i, 1));
    }
    const allDays: Date[] = [];
    months.forEach((m) => {
      weeksForMonth(m).forEach((w) => w.forEach((d) => allDays.push(d)));
    });
    const start = allDays[0];
    const finish = allDays[allDays.length - 1];
    // filter out any dates after today so we never roll forward
    const filtered = allDays.filter((d) => d <= end);
    const clampedEnd = finish > end ? end : finish;
    return { startDate: start, endDate: clampedEnd, days: filtered };
  }, [range]);

  // derive a map for rendering by merging zeroed range with any incoming activity
  const map = useMemo<ActivityMap>(() => {
    const base = zeroMap(startDate, endDate);
    if (!activity) return base;
    return Object.assign({}, base, activity);
  }, [activity, startDate, endDate]);

  // tooltip portal
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; node: React.ReactNode }>(
    null,
  );

  function toggleOpen() {
    if (isControlled) {
      onOpenChange?.(!effectiveOpen);
    } else {
      setUncontrolledOpen((s) => !s);
    }
  }

  function showTooltipForElement(el: HTMLElement, node: React.ReactNode) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    setTooltip({ x, y, node });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  // Persist open state (effective) to cookie when it changes (for controlled, rely on prop change)
  useEffect(() => {
    writeActivityOpenToCookie(effectiveOpen);
  }, [effectiveOpen]);

  useEffect(() => {
    writeActivityRangeToCookie(range);
  }, [range]);

  // (Debug listener removed)

  const tooltipPortal =
    tooltip && typeof document !== 'undefined'
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
              pointerEvents: 'auto',
            }}
          >
            {tooltip.node}
          </div>,
          document.body,
        )
      : null;

  function renderDaySquare(d: Date, extraClass = 'w-5 h-5 rounded-sm') {
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    if (d > todayMid) {
      // future date: render a non-interactive placeholder to preserve layout but hide future activity
      return (
        <div
          className={`${extraClass} bg-transparent border-2 border-gray-200 opacity-40`}
          aria-hidden
        />
      );
    }
    const key = formatDateISO(d);
    const count = map[key] ?? 0;
    const color = colorForCount(count);
    const border = borderForCount(count);
    const titles = activityDetails?.[key] ?? [];
    return (
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          aria-label={`${formatTooltipDateFromISO(key)} ${count} completed`}
          onMouseEnter={(e) => {
            if (!titles.length) return;
            const el = e.currentTarget as HTMLElement;
            showTooltipForElement(
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
                    {titles.length > 5 && (
                      <li className="text-xs">and {titles.length - 5} more…</li>
                    )}
                  </ul>
                ) : (
                  <div className="text-xs">No tasks</div>
                )}
              </div>,
            );
          }}
          onMouseLeave={() => hideTooltip()}
          onFocus={(e) => {
            if (!titles.length) return;
            const el = e.currentTarget as HTMLElement;
            showTooltipForElement(
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
                    {titles.length > 5 && (
                      <li className="text-xs">and {titles.length - 5} more…</li>
                    )}
                  </ul>
                ) : (
                  <div className="text-xs">No tasks</div>
                )}
              </div>,
            );
          }}
          className={`${extraClass} ${color} ${border} cursor-default`}
        />
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      <div className="flex items-center mb-2 select-none">
        <h5
          className="font-semibold cursor-pointer"
          onClick={toggleOpen}
          role="button"
          aria-expanded={effectiveOpen}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleOpen();
            }
          }}
        >
          Activity Tracker
        </h5>
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={effectiveOpen}
          aria-label={effectiveOpen ? 'Collapse activity tracker' : 'Expand activity tracker'}
          className="ml-3 w-7 h-7 flex items-center justify-center rounded border border-base-content/30 text-lg leading-none"
        >
          {effectiveOpen ? '−' : '+'}
        </button>
      </div>
      {effectiveOpen ? (
        <div className="transition-opacity duration-150 ease-in">
          <div className="flex items-center gap-3 mt-3 mb-3">
            <div className="flex rounded-md gap-3">
              <button
                onClick={() => setRange('3m')}
                className={`cursor-pointer border-2 border-gray-400 px-3 py-1 rounded text-sm ${
                  range === '3m' ? 'bg-base-100 shadow' : ''
                }`}
              >
                3 months
              </button>
              <button
                onClick={() => setRange('1m')}
                className={`cursor-pointer border-2 border-gray-400 px-3 py-1 rounded text-sm ${
                  range === '1m' ? 'bg-base-100 shadow' : ''
                }`}
              >
                1 month
              </button>
              <button
                onClick={() => setRange('1w')}
                className={`cursor-pointer border-2 border-gray-400 px-3 py-1 rounded text-sm ${
                  range === '1w' ? 'bg-base-100 shadow' : ''
                }`}
              >
                1 week
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {formatDateISO(startDate)} → {formatDateISO(endDate)}
            </div>
          </div>
          {tooltipPortal}
          <div className="overflow-x-auto pb-4">
            <div>
              {range === '1w' && (
                <div>
                  <div className="flex gap-2 items-center mb-2">
                    {(() => {
                      const start = addDays(endDate, -6);
                      return Array.from({ length: 7 }).map((_, i) => {
                        const d = addDays(start, i);
                        return (
                          <div key={i} className="text-xs text-gray-500 w-8 text-center">
                            {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {(() => {
                      const start = addDays(endDate, -6);
                      const arr: Date[] = [];
                      for (let cur = new Date(start); cur <= endDate; cur = addDays(cur, 1))
                        arr.push(new Date(cur));
                      return arr.map((d, i) => (
                        <div key={i} className="relative">
                          {renderDaySquare(d, 'w-8 h-8 rounded')}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
              {range === '1m' &&
                (() => {
                  const monthDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                  const monthWeeks = weeksForMonth(monthDate);
                  const cells = monthWeeks.flat();
                  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  return (
                    <div>
                      <div className="mb-2 font-semibold text-sm">
                        {monthDate.toLocaleDateString(undefined, {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-1 w-max">
                        {weekdays.map((w, i) => (
                          <div key={i} className="text-center w-5">
                            {w}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2 w-max">
                        {cells.map((d, i) => {
                          const inMonth = d.getMonth() === monthDate.getMonth();
                          return (
                            <div key={i} className={`relative ${inMonth ? '' : 'opacity-50'}`}>
                              {renderDaySquare(d, 'w-5 h-5 rounded-sm')}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              {range === '3m' && (
                <div className="flex gap-6 overflow-auto">
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const monthDate = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - (2 - idx),
                      1,
                    );
                    const monthWeeks = weeksForMonth(monthDate);
                    const cells = monthWeeks.flat();
                    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return (
                      <div key={idx} className="flex-none w-max">
                        <div className="mb-2 font-semibold text-sm">
                          {monthDate.toLocaleDateString(undefined, {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-1 w-max">
                          {weekdays.map((w, i) => (
                            <div key={i} className="text-center w-5">
                              {w}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2 w-max">
                          {cells.map((d, i) => (
                            <div
                              key={i}
                              className={`relative ${
                                d.getMonth() === monthDate.getMonth() ? '' : 'opacity-50'
                              }`}
                            >
                              {renderDaySquare(d, 'w-5 h-5 rounded-sm')}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
