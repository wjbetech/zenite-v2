'use client';

import React from 'react';

type Props = {
  initial?: {
    newTasks?: boolean;
    today?: boolean;
    week?: boolean;
    imminent?: boolean;
  };
};

export default function DashboardViewsSettings({
  initial = { newTasks: true, today: true, week: true, imminent: true },
}: Props) {
  const [newTasks, setNewTasks] = React.useState(!!initial.newTasks);
  const [today, setToday] = React.useState(!!initial.today);
  const [week, setWeek] = React.useState(!!initial.week);
  const [imminent, setImminent] = React.useState(!!initial.imminent);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={newTasks}
          onChange={(e) => setNewTasks(e.target.checked)}
        />
        <span className="text-sm">New Tasks</span>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={today}
          onChange={(e) => setToday(e.target.checked)}
        />
        <span className="text-sm">Today</span>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={week}
          onChange={(e) => setWeek(e.target.checked)}
        />
        <span className="text-sm">This Week</span>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox"
          checked={imminent}
          onChange={(e) => setImminent(e.target.checked)}
        />
        <span className="text-sm">Imminent</span>
      </label>
    </div>
  );
}
