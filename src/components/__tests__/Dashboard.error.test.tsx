import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../DashboardView/Dashboard';

jest.mock('../../lib/taskStore', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const { mock } = createUseTaskStoreMock({ error: 'Server failure' });
  return { __esModule: true, default: mock };
});

test('shows error paragraph when store provides an error', () => {
  render(<Dashboard />);
  // The component renders a paragraph explaining DB/unavailable state
  expect(screen.getByText(/unable to load tasks/i)).toBeInTheDocument();
});
