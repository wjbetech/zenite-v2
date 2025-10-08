import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
jest.mock('../../lib/taskStore', () => {
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const { mock, state } = createUseTaskStoreMock({});
  // expose to the test via global so assertions can inspect the spy
  (global as unknown as Record<string, unknown>).__useTaskStoreMock = { mock, state };
  return { __esModule: true, default: mock };
});

afterEach(() => {
  jest.clearAllMocks();
});

test('calls loadTasks on mount', async () => {
  const mockLoadTasks = (
    (global as unknown as Record<string, unknown>).__useTaskStoreMock as unknown as {
      state: { loadTasks: jest.Mock };
    }
  ).state.loadTasks;
  render(<Dashboard />);
  await waitFor(() => expect(mockLoadTasks).toHaveBeenCalledTimes(1));
});
