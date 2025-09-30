import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Mock next/navigation usePathname
jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => '/projects',
}));

// Mock next/link to render a plain anchor in tests so href attributes are present
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => {
    return <a href={href}>{children}</a>;
  },
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

  it('top-level nav links have correct hrefs and nested project links point to project pages', () => {
    render(<Sidebar isLoggedIn />);

    // Top-level links (Dashboard, Dailies, Projects, Settings) should have correct hrefs
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const dailiesLink = screen.getByRole('link', { name: /dailies/i });
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    expect(dashboardLink).toBeTruthy();
    expect(dailiesLink).toBeTruthy();
    expect(projectsLink).toBeTruthy();
    expect(settingsLink).toBeTruthy();

    // href in jsdom will be absolute; just assert it ends with the expected path
    expect(dashboardLink.getAttribute('href') || (dashboardLink as HTMLAnchorElement).href).toMatch(
      /\/dashboard$/,
    );
    expect(dailiesLink.getAttribute('href') || (dailiesLink as HTMLAnchorElement).href).toMatch(
      /\/dailies$/,
    );
    expect(projectsLink.getAttribute('href') || (projectsLink as HTMLAnchorElement).href).toMatch(
      /\/projects$/,
    );
    expect(settingsLink.getAttribute('href') || (settingsLink as HTMLAnchorElement).href).toMatch(
      /\/settings$/,
    );

    // Ensure nested project links exist and point to /projects/:id when the projects dropdown is open
    // The mock pathname is '/projects' so projectsOpen is true by default
    const nestedLink1 = screen.getByRole('link', { name: /one/i });
    const nestedLink2 = screen.getByRole('link', { name: /two/i });
    expect(nestedLink1).toBeTruthy();
    expect(nestedLink2).toBeTruthy();
    // Links now use slugified project names
    expect(nestedLink1.getAttribute('href') || (nestedLink1 as HTMLAnchorElement).href).toMatch(
      /\/projects\/one$/,
    );
    expect(nestedLink2.getAttribute('href') || (nestedLink2 as HTMLAnchorElement).href).toMatch(
      /\/projects\/two$/,
    );
  });
});
