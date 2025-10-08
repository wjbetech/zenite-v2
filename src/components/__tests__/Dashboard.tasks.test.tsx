import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

jest.mock('../../lib/taskStore', () => {
  // build the mock inside the factory to satisfy jest's hoisting safety
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const sampleTask = { id: 't1', title: 'Test task', completed: false };
  const { mock, state, setMockState } = createUseTaskStoreMock({ tasks: [sampleTask] });
  // expose for debugging if needed
  (global as unknown as Record<string, unknown>).__useTaskStoreMock = { mock, state, setMockState };
  return { __esModule: true, default: mock };
});

test('renders tasks from the store', () => {
  render(<Dashboard />);
  expect(screen.getByText(/test task/i)).toBeInTheDocument();
});
