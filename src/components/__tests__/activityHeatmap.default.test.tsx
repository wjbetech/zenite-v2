import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Dashboard from '../DashboardView/Dashboard';

function clearCookies() {
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach((c) => {
      const idx = c.indexOf('=');
      const name = idx > -1 ? c.slice(0, idx).trim() : c.trim();
      document.cookie = `${name}=; Path=/; Max-Age=0`;
    });
  }
}

afterEach(() => {
  cleanup();
  clearCookies();
});

test('ActivityHeatmap is collapsed by default for new users and persists state', () => {
  // ensure no cookie
  clearCookies();

  const { rerender } = render(<Dashboard />);

  // When collapsed the range buttons should not be in the DOM
  expect(screen.queryByText(/3 months/i)).toBeNull();

  // Open the heatmap by clicking the header toggle button (use aria-label)
  const toggle = screen.getByRole('button', { name: /Expand activity tracker/i });
  fireEvent.click(toggle);

  // Now range button should appear and cookie should be written
  expect(screen.getByText(/3 months/i)).toBeInTheDocument();
  const cookie = document.cookie;
  expect(
    cookie.includes('zenite.activityOpen=1') || cookie.includes('zenite.activityOpen=%221%22'),
  ).toBeTruthy();

  // Simulate page refresh by unmount and rerender Dashboard
  rerender(<Dashboard />);

  // Because cookie exists the heatmap should be open after re-render
  expect(screen.getByText(/3 months/i)).toBeInTheDocument();
});
