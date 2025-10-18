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

// mock api to avoid real fetch calls during tests
jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    deleteProject: jest.fn().mockResolvedValue({}),
    createProject: jest.fn().mockResolvedValue({}),
    updateProject: jest.fn().mockResolvedValue({}),
    fetchTasks: jest.fn().mockResolvedValue([]),
  },
}));

import ProjectsClient from '../ProjectsView/ProjectsClient';
import { toast } from 'react-toastify';
import { Project } from '../../lib/projectStore';

describe('ProjectsClient (smoke)', () => {
  it('renders empty state gracefully', () => {
    const projects: Project[] = [];
    render(React.createElement(ProjectsClient, { initialProjects: projects }));
    // The component shows an explanatory paragraph when data cannot be loaded
    return waitFor(() => expect(screen.queryByText(/unable to load tasks/i)).toBeTruthy());
  });

  it('renders list of projects', () => {
    const projects: Project[] = [
      { id: 'p1', name: 'A', createdAt: new Date().toISOString(), taskCount: 0 },
      { id: 'p2', name: 'B', createdAt: new Date().toISOString(), taskCount: 0 },
    ];
    render(React.createElement(ProjectsClient, { initialProjects: projects }));
    return waitFor(() => {
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();
    });
  });

  it('shows confirm modal, deletes project, shows toast, and removes it from view', async () => {
    const projects = [{ id: 'p1', name: 'ToDelete', createdAt: new Date().toISOString() }];
    render(React.createElement(ProjectsClient, { initialProjects: projects }));

    // wait for initial render
    await waitFor(() => expect(screen.getByText('ToDelete')).toBeTruthy());

    // click the delete button on the project card
    const deleteBtn = screen.getByRole('button', { name: /delete project/i });
    fireEvent.click(deleteBtn);

    // modal should appear
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    expect(dialog).toBeTruthy();

    // find confirm button within dialog and click it
    const confirmBtn = within(dialog).getByRole('button', { name: /delete project/i });
    fireEvent.click(confirmBtn);

    // wait for toast success to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Project has been deleted', expect.anything());
    });

    // project should be removed from view
    await waitFor(() => {
      expect(screen.queryByText('ToDelete')).not.toBeInTheDocument();
    });
  });
});
