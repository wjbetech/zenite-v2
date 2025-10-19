import { useEffect, useMemo, useState } from 'react';

export type View = 'imminent' | 'new' | 'today' | 'week';

export type TabDef = { id: View; show: boolean; label: string; minClass: string };

type Props = {
  showNew: boolean;
  showToday: boolean;
  showWeek: boolean;
  showImminent: boolean;
  initialView?: View;
};

export default function useDashboardTabs({
  showNew,
  showToday,
  showWeek,
  showImminent,
  initialView = 'new',
}: Props) {
  const tabs = useMemo<TabDef[]>(
    () => [
      { id: 'new', show: showNew, label: 'New Tasks', minClass: 'min-w-[200px] sm:min-w-[240px]' },
      { id: 'today', show: showToday, label: 'Today', minClass: 'min-w-[200px] sm:min-w-[240px]' },
      {
        id: 'week',
        show: showWeek,
        label: 'This Week',
        minClass: 'min-w-[200px] sm:min-w-[240px]',
      },
      {
        id: 'imminent',
        show: showImminent,
        label: 'Imminent',
        minClass: 'min-w-[180px] sm:min-w-[220px]',
      },
    ],
    [showNew, showToday, showWeek, showImminent],
  );

  const [view, setView] = useState<View>(initialView);

  // If the current view becomes disabled, pick the first enabled view (priority: new, today, week, imminent)
  useEffect(() => {
    const enabled: Record<View, boolean> = {
      new: showNew,
      today: showToday,
      week: showWeek,
      imminent: showImminent,
    };
    if (!enabled[view]) {
      if (showNew) setView('new');
      else if (showToday) setView('today');
      else if (showWeek) setView('week');
      else if (showImminent) setView('imminent');
    }
  }, [showNew, showToday, showWeek, showImminent, view]);

  return { tabs, view, setView } as const;
}
