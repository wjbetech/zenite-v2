'use client';

import React, { useMemo, useState, useEffect } from 'react';

const ACTIVITY_COOKIE_KEY = 'zenite.activityOpen';
const ACTIVITY_RANGE_KEY = 'zenite.activityRange';

function readCookie(key: string): string | null {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (!m) return null;
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

function writeCookie(key: string, value: string) {
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

type RangeKey = '3m' | '1m' | '1w';

export type ActivityMap = Record<string, number>; // yyyy-mm-dd -> count

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function startOfWeek(d: Date) {
  // Sunday as start
  const n = new Date(d);
  const day = n.getDay();
  n.setDate(n.getDate() - day);
  n.setHours(0, 0, 0, 0);
  return n;
}

function endOfWeek(d: Date) {
  const n = new Date(d);
  const day = n.getDay();
  n.setDate(n.getDate() + (6 - day));
  n.setHours(0, 0, 0, 0);
  return n;
}

function startOfMonth(d: Date) {
  const n = new Date(d.getFullYear(), d.getMonth(), 1);
  n.setHours(0, 0, 0, 0);
  return n;
}

function endOfMonth(d: Date) {
  const n = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  n.setHours(0, 0, 0, 0);
  return n;
}

function generateDemoData(start: Date, end: Date): ActivityMap {
  const map: ActivityMap = {};
  for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
    // random 0..6
    const r = Math.floor(Math.random() * 7);
    map[formatDateISO(cur)] = r;
  }
  return map;
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
  const idx = Math.min(Math.max(count, 1), 6) - 1;
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
  const idx = Math.min(Math.max(count, 1), 6) - 1;
  return borders[idx];
}

export default function ActivityHeatmap({
  activity,
  startRange = '3m',
  onOpenChange,
  open: openProp,
}: {
  activity?: ActivityMap;
  startRange?: RangeKey;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(() => {
    // prefer controlled prop initial value when provided
    if (typeof openProp === 'boolean') return openProp;
    // otherwise attempt to read stored value from cookie (client only)
    try {
      const val = typeof document !== 'undefined' ? readActivityOpenFromCookie() : null;
      if (val !== null) return val;
    } catch {}
    return false;
  });

  // sync controlled `open` prop when provided
  useEffect(() => {
    if (typeof openProp === 'boolean') setOpen(openProp);
  }, [openProp]);
  const [range, setRange] = useState<RangeKey>(() => {
    // If there's a stored cookie preference, prefer it (client only).
    try {
      if (typeof document !== 'undefined') {
        const r = readActivityRangeFromCookie();
        if (r) return r;
      }
    } catch {}
    // Otherwise fall back to the provided startRange prop (default '3m').
    return (startRange as RangeKey) ?? '3m';
  });

  // compute date range
  const { startDate, endDate, days } = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    // Use layout-friendly lengths: 1w = 7, 1m = 28 (4x7), 3m = 84 (3 * 4x7)
    if (range === '1w') {
      const length = 7;
      const start = addDays(end, -length + 1);
      const allDays: Date[] = [];
      for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1))
        allDays.push(new Date(cur));
      return { startDate: start, endDate: end, days: allDays };
    }

    if (range === '1m') {
      // use current calendar month: start from the week start that includes the 1st, to the week end that includes the last day
      const first = startOfMonth(end);
      const last = endOfMonth(end);
      const start = startOfWeek(first);
      const finish = endOfWeek(last);
      const allDays: Date[] = [];
      for (let cur = new Date(start); cur <= finish; cur = addDays(cur, 1))
        allDays.push(new Date(cur));
      return { startDate: start, endDate: finish, days: allDays };
    }

    // default 3 months: show last 84 days
    const length = 84; // default 3 months
    const start = addDays(end, -length + 1);
    const allDays: Date[] = [];
    for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) allDays.push(new Date(cur));
    return { startDate: start, endDate: end, days: allDays };
  }, [range]);

  // avoid generating random demo data during server render to prevent
  // hydration mismatches. Initialize to zeros on first render (server and
  // client) and only generate demo data on the client after mount.
  const [map, setMap] = useState<ActivityMap>(() => {
    if (activity) return activity;
    return zeroMap(startDate, endDate);
  });

  useEffect(() => {
    if (activity) {
      setMap(activity);
      return;
    }
    // generate demo data only on client after mount
    const demo = generateDemoData(startDate, endDate);
    setMap(demo);
  }, [activity, startDate, endDate]);

  // prepare layouts
  const daysArr = days;
  // chunk into weeks of 7 (left-to-right across days)
  const weeks = [] as Date[][];
  for (let i = 0; i < daysArr.length; i += 7) {
    weeks.push(daysArr.slice(i, i + 7));
  }

  const shortDayName = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);

  // (removed) Do not call parent setState during render — the effect below
  // will notify the parent after the component has rendered and `open`
  // has stabilized.

  // persist open state to cookie whenever it changes and inform parent
  useEffect(() => {
    try {
      writeActivityOpenToCookie(open);
    } catch {}
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // persist range selection to cookie
  useEffect(() => {
    try {
      writeActivityRangeToCookie(range);
    } catch {}
  }, [range]);

  return (
    <div className="w-full">
      <div className="flex items-center mb-2">
        <h5 className="font-semibold">Activity Tracker</h5>
        <button
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-label={open ? 'Collapse activity tracker' : 'Expand activity tracker'}
          className="ml-1 text-lg cursor-pointer flex items-center justify-center"
          style={{ marginLeft: 6, width: 24, height: 24 }}
        >
          {open ? '−' : '+'}
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out transform will-change-[opacity,transform,height] ${
          open
            ? 'max-h-[1500px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="flex items-center align-bottom gap-3 mb-3">
          <div className="flex rounded-md mb-2 gap-3">
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

        <div className="overflow-x-auto">
          <div className="">
            {/* Week view: single row with labels */}
            {range === '1w' && (
              <div>
                {(() => {
                  const week0 =
                    weeks[0] ?? Array.from({ length: 7 }).map(() => null as unknown as Date);
                  return (
                    <>
                      <div className="flex gap-2 items-center mb-2">
                        {week0.map((d, i) => (
                          <div key={i} className="text-xs text-gray-500 w-8 text-center">
                            {d ? shortDayName(d) : ''}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {week0.map((d, i) => {
                          const key = d ? formatDateISO(d) : `empty-${i}`;
                          const count = d ? map[key] ?? 0 : 0;
                          const color = colorForCount(count);
                          const border = borderForCount(count);
                          const title = d
                            ? `${key}: ${count} completed task${count === 1 ? '' : 's'}`
                            : 'No date';
                          return (
                            <div
                              key={i}
                              title={title}
                              className={`w-8 h-8 rounded-sm ${color} ${border} cursor-default`}
                            />
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Month view: tight grid, mute days outside current month */}
            {range === '1m' &&
              (() => {
                const targetMonth = new Date().getMonth();
                return (
                  <div className="grid grid-cols-7 gap-1">
                    {daysArr.map((d, i) => {
                      const key = formatDateISO(d);
                      const inMonth = d.getMonth() === targetMonth;
                      const count = map[key] ?? 0;
                      // if not in the current month, mute the box
                      const color = inMonth ? colorForCount(count) : 'bg-transparent';
                      const border = inMonth ? borderForCount(count) : 'border-2 border-gray-400';
                      const opacity = inMonth ? '' : 'opacity-50';
                      const title = `${key}: ${count} completed task${count === 1 ? '' : 's'}`;
                      return (
                        <div
                          key={i}
                          title={title}
                          className={`w-5 h-5 rounded-sm ${color} ${border} ${opacity} cursor-default`}
                        />
                      );
                    })}
                  </div>
                );
              })()}

            {/* 3-month view: three 4x7 panels with dividers */}
            {range === '3m' && (
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, panelIdx) => {
                  const start = panelIdx * 28;
                  const panelDays = daysArr.slice(start, start + 28);
                  return (
                    <div key={panelIdx} className="flex flex-col gap-2">
                      <div className="grid grid-cols-7 gap-2">
                        {panelDays.map((d, i) => {
                          if (!d) return <div key={i} className="w-5 h-5" />;
                          const key = formatDateISO(d);
                          const count = map[key] ?? 0;
                          const color = colorForCount(count);
                          const border = borderForCount(count);
                          const title = `${key}: ${count} completed task${count === 1 ? '' : 's'}`;
                          return (
                            <div
                              key={i}
                              title={title}
                              className={`w-5 h-5 rounded-sm ${color} ${border} cursor-default`}
                            />
                          );
                        })}
                      </div>
                      {panelIdx < 2 && <div className="h-px bg-base-200 mt-2" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
