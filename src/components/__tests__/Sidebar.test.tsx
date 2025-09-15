import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Mock next/navigation usePathname
jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => '/projects',
}));

// Mock Clerk's useUser to report a logged-in user
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'u1' } }),
}));

// Mock project store with a small set of projects
jest.mock('../../lib/projectStore', () => ({
  __esModule: true,
  default: (selector: (state: unknown) => unknown) =>
    typeof selector === 'function'
      ? selector({
          projects: [
            { id: 'p1', name: 'One', starred: false },
            { id: 'p2', name: 'Two', starred: true },
          ],
          updateProject: jest.fn(),
        })
      : undefined,
}));

import Sidebar from '../Sidebar';

describe('Sidebar behavior', () => {
  beforeEach(() => {
    // clear any persisted sidebar state
    localStorage.removeItem('zenite.sidebarCollapsed');
  });

  afterEach(() => {
    cleanup();
  });

  it('toggles collapse when collapse button clicked and persists to localStorage', () => {
    const { unmount } = render(<Sidebar isLoggedIn />);

    // initially un-collapsed: button aria-label should be 'Collapse sidebar'
    const toggleBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleBtn).toBeTruthy();

    // click to collapse
    fireEvent.click(toggleBtn);

    // now button should say Expand sidebar
    const expandBtn = screen.getByRole('button', { name: /expand sidebar/i });
    expect(expandBtn).toBeTruthy();

    // localStorage should reflect collapsed=true
    expect(localStorage.getItem('zenite.sidebarCollapsed')).toBe('true');

    // unmount and remount to simulate refresh
    unmount();
    render(<Sidebar isLoggedIn />);

    // after remount, collapsed state should be read from localStorage and button should be 'Expand sidebar'
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeTruthy();
  });

  it('toggles projects nested list with chevron and updates aria attributes', () => {
    render(<Sidebar isLoggedIn />);

    // The projects chevron button is present when sidebar is expanded
    const chevron = screen.getByRole('button', { name: /collapse projects|expand projects/i });
    expect(chevron).toBeTruthy();

    // Initially (usePathname '/projects') the projectsOpen state should be true => aria-expanded=true
    expect(chevron).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse projects
    fireEvent.click(chevron);
    expect(chevron).toHaveAttribute('aria-expanded', 'false');

    // The nested projects container should have aria-hidden true
    const nested = document.getElementById('sidebar-projects');
    expect(nested).toBeTruthy();
    expect(nested).toHaveAttribute('aria-hidden', 'true');
  });
});
