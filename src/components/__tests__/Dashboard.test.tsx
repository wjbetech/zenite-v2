import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

// Mock task store
jest.mock('../../lib/taskStore', () => {
  const mockState = {
    tasks: [],
    createTask: jest.fn(),
    loadTasks: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    setTasks: jest.fn(),
  };
  return {
    __esModule: true,
    // @ts-expect-error - test mock factory may receive a selector function
    default: (selector) => {
      if (typeof selector === 'function') return selector(mockState);
      return mockState;
    },
  };
});

// Mock project store
jest.mock('../../lib/projectStore', () => {
  const mockState = {
    projects: [
      { id: 'p1', name: 'One' },
      { id: 'p2', name: 'Two' },
    ],
    createProject: jest.fn((name: string) => ({ id: `p-${name}`, name })),
    setProjects: jest.fn(),
    updateProject: jest.fn(),
  };
  return {
    __esModule: true,
    // @ts-expect-error - test mock factory may receive a selector function
    default: (selector) => {
      if (typeof selector === 'function') return selector(mockState);
      return mockState;
    },
  };
});

// Render Dashboard and assert modals open with correct content
import Dashboard from '../Dashboard';

describe('Dashboard modals', () => {
  it('opens Add New Task modal when New Task clicked', () => {
    render(React.createElement(Dashboard));

    // Use exact text to avoid matching 'New Tasks' filter button
    const newTaskBtn = screen.getByText((c: unknown) => (c as string) === 'New Task');
    expect(newTaskBtn).toBeTruthy();

    fireEvent.click(newTaskBtn);

    // Modal should show 'Add New Task' header (allowCreateProject=false => Add New Task)
    expect(screen.getByText(/add new task/i)).toBeTruthy();

    // Modal should show the Title label (inputs are not associated via for/id so check the label text)
    expect(screen.getByText(/title/i)).toBeTruthy();
  });

  it('opens Add New Project modal when New Project clicked and shows new project input and Create task toggle', () => {
    render(React.createElement(Dashboard));

    const newProjBtn = screen.getByRole('button', { name: /new project/i });
    expect(newProjBtn).toBeTruthy();

    fireEvent.click(newProjBtn);

    // Modal header should be 'Add New Project' (disambiguate from button)
    expect(screen.getByRole('heading', { name: /add new project/i })).toBeTruthy();

    // Find the modal form via the heading and query inside it
    const header = screen.getByRole('heading', { name: /add new project/i });
    const form = header.closest('form');
    expect(form).toBeTruthy();

    const modal = within(form as HTMLElement);

    // The New project input exists inside the modal form
    // There may be multiple textboxes (input + textarea), pick the first which is the project name input
    const textboxes = modal.getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThan(0);
    const newProjInput = textboxes[0];
    expect(newProjInput).toBeTruthy();

    // The 'Create task' toggle checkbox labeled 'Create task' should be present inside the modal
    const createTaskToggle = modal.getByRole('checkbox', { name: /create task/i });
    expect(createTaskToggle).toBeTruthy();
  });
});
