'use client';

import React from 'react';
import useSettingsStore from '@/lib/settingsStore';

export default function DashboardViewsSettings() {
  const newTasks = useSettingsStore((s) => s.newTasks);
  const today = useSettingsStore((s) => s.today);
  const week = useSettingsStore((s) => s.week);
  const imminent = useSettingsStore((s) => s.imminent);

  const setNewTasks = useSettingsStore((s) => s.setNewTasks);
  const setToday = useSettingsStore((s) => s.setToday);
  const setWeek = useSettingsStore((s) => s.setWeek);
  const setImminent = useSettingsStore((s) => s.setImminent);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={newTasks}
          onChange={(e) => setNewTasks(e.target.checked)}
        />
  <div className="tooltip tooltip-top" data-tip="New Tasks: tasks filtered strictly by the date and time they were created.">
          <span className="text-sm">New Tasks</span>
        </div>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={today}
          onChange={(e) => setToday(e.target.checked)}
        />
  <div className="tooltip tooltip-top" data-tip="Today: shows tasks that are due today, sorted by the time they are due.">
          <span className="text-sm">Today</span>
        </div>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={week}
          onChange={(e) => setWeek(e.target.checked)}
        />
  <div className="tooltip tooltip-top" data-tip="This Week: shows tasks with a due date within 1 week from today, sorted by the time they are due.">
          <span className="text-sm">This Week</span>
        </div>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={imminent}
          onChange={(e) => setImminent(e.target.checked)}
        />
  <div className="tooltip tooltip-top" data-tip="Imminent: filters tasks strictly by the time they are due.">
          <span className="text-sm">Imminent</span>
        </div>
      </label>
    </div>
  );
}
