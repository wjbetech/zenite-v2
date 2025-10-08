import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

jest.mock('../../lib/taskStore', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const { mock } = createUseTaskStoreMock({ error: 'Server failure' });
  return { __esModule: true, default: mock };
});

test('shows error alert when store provides an error', () => {
  render(<Dashboard />);
  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent(/server failure/i);
});
