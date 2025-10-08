import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
jest.mock('../../lib/taskStore', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const { mock, state, setMockState } = createUseTaskStoreMock({ loading: true });
  (global as unknown as Record<string, unknown>).__useTaskStoreMock = { mock, state, setMockState };
  return { __esModule: true, default: mock };
});

test('shows loading indicator when tasks are loading', () => {
  // ensure loading is true in the mock state
  const setMockState = (
    (global as unknown as Record<string, unknown>).__useTaskStoreMock as unknown as {
      setMockState: (n: Record<string, unknown>) => void;
    }
  ).setMockState;
  setMockState({ loading: true });
  render(<Dashboard />);

  // The Dashboard shows a loading message or spinner. We assert on text used in UI.
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
