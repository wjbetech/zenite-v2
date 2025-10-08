import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';

jest.mock('../../lib/taskStore', () => {
  const { createUseTaskStoreMock } = require('../../test-utils/useTaskStoreMock');
  const { mock } = createUseTaskStoreMock({ tasks: [] });
  return { __esModule: true, default: mock };
});

test('view toggle buttons update aria-pressed when clicked', async () => {
  render(<Dashboard />);
  const user = userEvent.setup();

  const newBtn = screen.getByRole('button', { name: /new tasks/i });
  const todayBtn = screen.getByRole('button', { name: /today/i });
  const weekBtn = screen.getByRole('button', { name: /this week/i });
  const imminentBtn = screen.getByRole('button', { name: /imminent/i });

  // initial: 'New Tasks' is pressed by default
  expect(newBtn).toHaveAttribute('aria-pressed', 'true');

  await user.click(todayBtn);
  expect(todayBtn).toHaveAttribute('aria-pressed', 'true');

  await user.click(weekBtn);
  expect(weekBtn).toHaveAttribute('aria-pressed', 'true');

  await user.click(imminentBtn);
  expect(imminentBtn).toHaveAttribute('aria-pressed', 'true');
});
