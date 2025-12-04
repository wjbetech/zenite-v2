import React from 'react';
import { render, screen } from '@testing-library/react';
import CalendarClient from '../CalendarView/CalendarClient';

test('calendar client renders header and view controls (outside scroll)', () => {
  render(<CalendarClient />);

  // header text exists (page header and date header will be present)
  expect(screen.getByText(/Calendar/)).toBeTruthy();

  // check the view toggle and Today button exist
  expect(screen.getByRole('button', { name: /^Month$/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /^Week$/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /^Day$/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /^Today$/i })).toBeTruthy();
});
