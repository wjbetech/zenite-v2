import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';

jest.mock('../../lib/taskStore', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const { mock } = createUseTaskStoreMock({ tasks: [] });
  return { __esModule: true, default: mock };
});

test('view toggle buttons update aria-pressed when clicked', async () => {
  render(<Dashboard />);
  const user = userEvent.setup();

  const newBtn = screen.getByRole('tab', { name: /new tasks/i });
  const todayBtn = screen.getByRole('tab', { name: /today/i });
  const weekBtn = screen.getByRole('tab', { name: /this week/i });
  const imminentBtn = screen.getByRole('tab', { name: /imminent/i });

  // initial: 'New Tasks' is selected by default
  expect(newBtn).toHaveAttribute('aria-selected', 'true');

  await user.click(todayBtn);
  expect(todayBtn).toHaveAttribute('aria-selected', 'true');

  await user.click(weekBtn);
  expect(weekBtn).toHaveAttribute('aria-selected', 'true');

  await user.click(imminentBtn);
  expect(imminentBtn).toHaveAttribute('aria-selected', 'true');
});
