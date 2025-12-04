import React from 'react';
import { render, screen, within } from '@testing-library/react';
import DayView from '../CalendarView/DayView';
import type { Task } from '../../lib/taskStore';

describe('DayView recurring daily tasks', () => {
  const date = new Date('2025-12-04T12:00:00');

  test('shows daily tasks in the all-day section when no time is set', () => {
    const tasks: Task[] = [
      { id: 'd1', title: 'Daily All', recurrence: 'daily', createdAt: new Date().toISOString() },
    ];

    render(<DayView date={date} tasks={tasks} />);

    // the "All day" heading is nested inside a wrapper; use parentElement to scope
    const header = screen.getByText('All day');
    const parent = header.parentElement as HTMLElement | null;
    expect(parent).toBeTruthy();
    expect(within(parent as HTMLElement).getByText('Daily All')).toBeInTheDocument();
  });

  test('shows daily timed tasks in the hour grid', () => {
    const tasks: Task[] = [
      {
        id: 'd2',
        title: 'Daily 9am',
        recurrence: 'daily',
        dueTime: '09:00',
        createdAt: new Date().toISOString(),
      },
    ];

    render(<DayView date={date} tasks={tasks} />);

    // The timed task should appear somewhere in the hour grid (not in the all-day section)
    const elem = screen.getByText('Daily 9am');
    expect(elem).toBeInTheDocument();

    // ensure it's not inside the all-day block
    const allDayHeader = screen.getByText('All day');
    const allDayParent = allDayHeader.parentElement as HTMLElement | null;
    if (allDayParent) expect(allDayParent.textContent).not.toContain('Daily 9am');
  });

  test('hour labels run from 6am through 11pm (midnight not shown as separate hour)', () => {
    const tasks: Task[] = [];
    render(<DayView date={date} tasks={tasks} />);

    // first rendered hour should be 6 am and should not show 12 am..5 am
    expect(screen.getByText(/6 am/i)).toBeInTheDocument();
    // use exact matching to avoid accidental substring matches (e.g., `1 am` matching `11 am`)
    expect(screen.queryByText(/^12 am$/i)).toBeNull();
    expect(screen.queryByText(/^1 am$/i)).toBeNull();
    expect(screen.queryByText(/^5 am$/i)).toBeNull();
  });
});
