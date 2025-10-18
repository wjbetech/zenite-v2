import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the taskStore to supply a small set of tasks covering daily and due dates
jest.mock('../../lib/taskStore', () => {
  // compute dates inline for task dueDate fields (no unused locals)

  const mockState = {
    tasks: [
      {
        id: 'a',
        title: 'Daily Task',
        recurrence: 'daily',
        createdAt: new Date().toISOString(),
        completed: false,
      },
      {
        id: 'b',
        title: 'Due Today',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        completed: false,
      },
      {
        id: 'c',
        title: 'Due In 3',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        createdAt: new Date().toISOString(),
        completed: false,
      },
      {
        id: 'd',
        title: 'Due In 8',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
        createdAt: new Date().toISOString(),
        completed: false,
      },
    ],
    createTask: jest.fn(),
    loadTasks: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    setTasks: jest.fn(),
  };
  return {
    __esModule: true,
    // @ts-expect-error - test mock factory may receive a selector function
    default: (selector) => {
      if (typeof selector === 'function') return selector(mockState);
      return mockState;
    },
  };
});

import Dashboard from '../DashboardView/Dashboard';

describe('Dashboard bucketing', () => {
  it('shows daily and due-today tasks in Today view', () => {
    render(React.createElement(Dashboard));

    // Click the Today tab
    const todayBtn = screen.getByRole('tab', { name: /today/i });
    fireEvent.click(todayBtn);

    // Both 'Daily Task' and 'Due Today' should be visible (query via role=article with accessible name)
    expect(screen.getByRole('article', { name: /task daily task/i })).toBeTruthy();
    expect(screen.getByRole('article', { name: /task due today/i })).toBeTruthy();
  });

  it('shows tasks due within the next 6 days in Week view, but not 7+ days', () => {
    render(React.createElement(Dashboard));

    const weekBtn = screen.getByRole('tab', { name: /this week/i });
    fireEvent.click(weekBtn);

    // 'Due In 3' should appear; 'Due In 8' should not (query via role=article)
    expect(screen.getByRole('article', { name: /task due in 3/i })).toBeTruthy();
    expect(screen.queryByRole('article', { name: /task due in 8/i })).toBeNull();
  });
});
