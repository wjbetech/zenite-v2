import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

// Mock the project store so we don't import the real `nanoid`/Zustand setup
jest.mock('../../lib/projectStore', () => {
  type MockProject = { id: string; name: string; createdAt: string };
  const mockState: {
    projects: MockProject[];
    createProject: (name: string) => MockProject;
    deleteProject: (id: string) => void;
    setProjects: (p: MockProject[]) => void;
    loadRemote: undefined | (() => Promise<void>);
  } = {
    projects: [],
    createProject: (name: string) => {
      const p: MockProject = {
        id: `mock-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
      };
      mockState.projects = [p, ...mockState.projects];
      return p;
    },
    deleteProject: (id: string) => {
      mockState.projects = mockState.projects.filter((p) => p.id !== id);
    },
    setProjects: (p: MockProject[]) => {
      mockState.projects = p;
    },
    loadRemote: undefined,
  };

  return {
    __esModule: true,
    // default export is a selector function in the real hook; emulate that
    // @ts-expect-error - test mock factory may receive a selector function
    default: (selector) => {
      if (typeof selector === 'function') return selector(mockState);
      return mockState;
    },
  };
});

// mock react-toastify so we can assert toasts
jest.mock('react-toastify', () => ({
  toast: {
    dismiss: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import ProjectsClient from '../ProjectsClient';
import { toast } from 'react-toastify';

describe('ProjectsClient (smoke)', () => {
  it('renders empty state gracefully', () => {
    const projects: Array<{ id: string; name: string; createdAt: string }> = [];
    render(React.createElement(ProjectsClient, { initialProjects: projects }));
    expect(screen.queryByText(/no projects yet/i)).toBeTruthy();
  });

  it('renders list of projects', () => {
    const projects: Array<{ id: string; name: string; createdAt: string }> = [
      { id: 'p1', name: 'A', createdAt: new Date().toISOString() },
      { id: 'p2', name: 'B', createdAt: new Date().toISOString() },
    ];
    render(React.createElement(ProjectsClient, { initialProjects: projects }));
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });

  it('shows confirm modal, deletes project, shows toast, and removes it from view', async () => {
    const projects = [{ id: 'p1', name: 'ToDelete', createdAt: new Date().toISOString() }];
    render(React.createElement(ProjectsClient, { initialProjects: projects }));

    // initial project exists
    expect(screen.getByText('ToDelete')).toBeTruthy();

    // click the delete button on the project card
    const deleteBtn = screen.getByRole('button', { name: /delete project/i });
    fireEvent.click(deleteBtn);

    // modal should appear
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();

    // find confirm button within dialog and click it
    const confirmBtn = within(dialog).getByRole('button', { name: /delete project/i });
    fireEvent.click(confirmBtn);

    // wait for toast success to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Project has been deleted', expect.any(Object));
    });

    // project should be removed from view
    await waitFor(() => {
      expect(screen.queryByText('ToDelete')).not.toBeInTheDocument();
    });
  });
});
