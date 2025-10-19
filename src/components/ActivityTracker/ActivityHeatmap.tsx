'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TooltipPortal from './TooltipPortal';

import { zeroMap, RangeKey, ActivityMap } from '../../lib/activity-date';
import { computeRangeDays } from '../../lib/activity-range';
import ActivityWeekView from './ActivityWeekView';
import ActivityMonthPanel from './ActivityMonthPanel';
import RangeSelector from './RangeSelector';
import {
  readActivityOpenFromCookie,
  writeActivityOpenToCookie,
  readActivityRangeFromCookie,
  writeActivityRangeToCookie,
} from '../../lib/activity-cookie';

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
  // Default: hidden. If the cookie explicitly exists and equals '1', respect it; otherwise start closed.
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(() => {
    if (isControlled) return !!openProp;
    const cookieVal = readActivityOpenFromCookie();
    return cookieVal === true;
  });
  const effectiveOpen = isControlled ? !!openProp : uncontrolledOpen;

  const [range, setRange] = useState<RangeKey>(() => {
    const r = readActivityRangeFromCookie();
    return (r as RangeKey) ?? startRange;
  });

  // compute date range and days depending on range selection
  const { startDate, endDate } = useMemo(() => computeRangeDays(range), [range]);

  // derive a map for rendering by merging zeroed range with any incoming activity
  const map = useMemo<ActivityMap>(() => {
    const base = zeroMap(startDate, endDate);
    if (!activity) return base;
    return { ...base, ...activity } as ActivityMap;
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

  const showTooltipForElement = React.useCallback((el: HTMLElement, node: React.ReactNode) => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    setTooltip({ x, y, node });
  }, []);

  const hideTooltip = React.useCallback(() => {
    setTooltip(null);
  }, []);

  // Persist open state (effective) to cookie when it changes (for controlled, rely on prop change)
  useEffect(() => {
    writeActivityOpenToCookie(effectiveOpen);
  }, [effectiveOpen]);

  useEffect(() => {
    writeActivityRangeToCookie(range);
  }, [range]);

  // (Debug listener removed)

  // tooltip portal is rendered via a small component to keep this file focused
  // and to make it easy to test/override if needed.

  // Day squares moved to ActivityDaySquare component

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.28, ease: 'easeInOut' } }}
      className="relative w-full px-1 pt-3 pb-1 overflow-hidden"
    >
      <div className="relative flex items-center mb-2 select-none">
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
        <motion.button
          type="button"
          onClick={toggleOpen}
          aria-expanded={effectiveOpen}
          aria-label={effectiveOpen ? 'Collapse activity tracker' : 'Expand activity tracker'}
          className="ml-1 w-7 h-7 flex items-center justify-center rounded text-lg leading-none cursor-pointer"
          animate={{ rotate: effectiveOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {effectiveOpen ? '−' : '+'}
        </motion.button>
      </div>
      {/* Framer Motion expand/collapse animation */}
      <AnimatePresence initial={false}>
        {effectiveOpen && (
          <motion.div
            layout // enable shared layout transitions
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut', layout: { duration: 0.28 } }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 mt-3 mb-3">
              <RangeSelector value={range} onChange={(r) => setRange(r)} />
            </div>
            <TooltipPortal tooltip={tooltip} />
            <div className="overflow-x-auto overflow-y-hidden">
              <AnimatePresence mode="wait">
                {range === '1w' && (
                  <motion.div
                    key="1w"
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeInOut', layout: { duration: 0.28 } }}
                  >
                    <ActivityWeekView
                      endDate={endDate}
                      map={map}
                      activityDetails={activityDetails}
                      onShowTooltip={showTooltipForElement}
                      onHideTooltip={hideTooltip}
                    />
                  </motion.div>
                )}
                {range === '1m' && (
                  <motion.div
                    key="1m"
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeInOut', layout: { duration: 0.28 } }}
                  >
                    <ActivityMonthPanel
                      monthDate={new Date(endDate.getFullYear(), endDate.getMonth(), 1)}
                      map={map}
                      activityDetails={activityDetails}
                      onShowTooltip={showTooltipForElement}
                      onHideTooltip={hideTooltip}
                    />
                  </motion.div>
                )}
                {range === '3m' && (
                  <motion.div
                    key="3m"
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeInOut', layout: { duration: 0.28 } }}
                    className="flex gap-6 overflow-auto"
                  >
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <ActivityMonthPanel
                        key={idx}
                        monthDate={
                          new Date(endDate.getFullYear(), endDate.getMonth() - (2 - idx), 1)
                        }
                        map={map}
                        activityDetails={activityDetails}
                        onShowTooltip={showTooltipForElement}
                        onHideTooltip={hideTooltip}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
