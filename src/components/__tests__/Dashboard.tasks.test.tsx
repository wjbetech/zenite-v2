import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../DashboardView/Dashboard';

jest.mock('../../lib/taskStore', () => {
  // Inline selector-style mock to avoid require() in the factory
  const sampleTask = { id: 't1', title: 'Test task', completed: false };
  const state = {
    tasks: [sampleTask],
    loading: false,
    error: null,
    loadTasks: jest.fn().mockResolvedValue(undefined),
    setTasks: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resetDailiesIfNeeded: jest.fn(),
    resetDailiesNow: jest.fn(),
  } as const;

  const mock = (selector: (s: unknown) => unknown) => selector(state as unknown);
  return { __esModule: true, default: mock };
});

test('renders tasks from the store', () => {
  render(<Dashboard />);
  expect(screen.getByText(/test task/i)).toBeInTheDocument();
});
