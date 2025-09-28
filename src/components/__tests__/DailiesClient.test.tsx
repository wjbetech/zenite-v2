import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DailiesClient from '../DailiesClient';
import useTaskStore, { type Task } from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';
import api from '../../lib/api';

// The repo already uses localStorage-backed zustand stores. For tests we should seed the stores directly.

describe('DailiesClient integration', () => {
  beforeEach(() => {
    // reset stores
    const taskApi = useTaskStore.getState();
    const projectApi = useProjectStore.getState();
    taskApi.setTasks([]);
    projectApi.setProjects([]);
    // Ensure network calls used by the store are mocked in tests that exercise UI flows
    jest.spyOn(api, 'createTask').mockImplementation(async (payload: Record<string, unknown>) => ({
      id: `task-${Math.random().toString(36).slice(2, 8)}`,
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate ?? null,
      recurrence: payload.recurrence ?? null,
      projectId: payload.projectId ?? null,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      started: false,
    }));
    // Replace store methods so UI interactions update the in-memory store immediately
    const taskApiState = useTaskStore.getState();
    // Define the minimal interface we need to override on the store for tests
    type TaskStoreOverrides = {
      updateTask: (id: string, patch: Partial<Task>) => Promise<Task | undefined>;
      deleteTask: (id: string) => Promise<unknown>;
    };
    const overrides: Partial<TaskStoreOverrides> = {
      updateTask: jest.fn(async (id: string, patch: Partial<Task>) => {
        const s = useTaskStore.getState();
        const tasks = s.tasks.map((t) => (t.id === id ? { ...t, ...(patch as Partial<Task>) } : t));
        s.setTasks(tasks);
        return tasks.find((t) => t.id === id);
      }),
      deleteTask: jest.fn(async (id: string) => {
        const s = useTaskStore.getState();
        s.setTasks(s.tasks.filter((t) => t.id !== id));
        return {};
      }),
    };
    // Assign overrides with a typed cast to the exact partial shape we defined
    (taskApiState as unknown as TaskStoreOverrides).updateTask = overrides.updateTask!;
    (taskApiState as unknown as TaskStoreOverrides).deleteTask = overrides.deleteTask!;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Add Daily Task button opens create modal and creates a task', async () => {
    render(<DailiesClient />);

    // Click the desktop add button by its visible text to avoid duplicate aria-labels
    const addBtn = screen.getByText('+ Add Daily Task');
    fireEvent.click(addBtn);

    // Create modal should appear
    const titleInput = await screen.findByLabelText(/Daily task title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Add' } });

    const createBtn = screen.getByRole('button', { name: /create daily/i });
    fireEvent.click(createBtn);

    // The create modal closes; the new task should be rendered in the list
    const task = await screen.findByText('Test Add');
    expect(task).toBeInTheDocument();
  });

  test('Edit button opens edit modal and saves changes', async () => {
    // seed one daily task directly into the store to avoid network calls
    const taskApi = useTaskStore.getState();
    taskApi.setTasks([
      {
        id: 't-edit-1',
        title: 'Editable',
        recurrence: 'daily',
        createdAt: new Date().toISOString(),
      },
    ] as Task[]);

    render(<DailiesClient />);

    // Find the card and the edit button (aria-label="Edit task")
    await screen.findByText('Editable');
    // hover effect might hide the button; directly query by aria-label
    const editBtn = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editBtn);

    // Edit modal should open with input
    const titleInput = await screen.findByLabelText(/Task title/i);
    expect(titleInput).toHaveValue('Editable');

    fireEvent.change(titleInput, { target: { value: 'Edited Title' } });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    // Modal closes and updated title shows
    const updated = await screen.findByText('Edited Title');
    expect(updated).toBeInTheDocument();
  });

  test('Delete button opens confirm modal and deletes task', async () => {
    // seed the store directly to avoid calling api.createTask
    const taskApi = useTaskStore.getState();
    taskApi.setTasks([
      {
        id: 't-delete-1',
        title: 'ToDelete',
        recurrence: 'daily',
        createdAt: new Date().toISOString(),
      },
    ] as Task[]);

    render(<DailiesClient />);

    const deleteBtn = await screen.findByRole('button', { name: /delete task/i });
    fireEvent.click(deleteBtn);

    // Confirm delete modal shows
    // There are two delete buttons (card and modal), ensure we click the modal one by narrowing scope
    const modal = screen.getByRole('dialog');
    const modalConfirm = within(modal).getByRole('button', { name: /delete task/i });
    fireEvent.click(modalConfirm);

    // Task should be removed
    expect(screen.queryByText('ToDelete')).not.toBeInTheDocument();
  });

  test('Task shows project name when connected', async () => {
    // Seed a project and a task connected to it
    const projectApi = useProjectStore.getState();
    projectApi.setProjects([
      { id: 'proj-1', name: 'Health and Lifestyle', createdAt: new Date().toISOString() },
    ]);

    const taskApi = useTaskStore.getState();
    taskApi.setTasks([
      {
        id: 't-proj-1',
        title: 'Workout',
        recurrence: 'daily',
        projectId: 'proj-1',
        createdAt: new Date().toISOString(),
      },
    ] as Task[]);

    render(<DailiesClient />);

    // Should show 'Workout - (Health and Lifestyle)'
    const labeled = await screen.findByText('Workout - (Health and Lifestyle)');
    expect(labeled).toBeInTheDocument();
  });
});
