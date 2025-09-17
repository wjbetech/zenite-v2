import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DailiesClient from '../DailiesClient';
import useTaskStore from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';

// The repo already uses localStorage-backed zustand stores. For tests we should seed the stores directly.

describe('DailiesClient integration', () => {
  beforeEach(() => {
    // reset stores
    const taskApi = useTaskStore.getState();
    const projectApi = useProjectStore.getState();
    taskApi.setTasks([]);
    projectApi.setProjects([]);
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
    // seed one daily task
    const taskApi = useTaskStore.getState();
    taskApi.createTask({ title: 'Editable', recurrence: 'daily' });

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
    const taskApi = useTaskStore.getState();
    taskApi.createTask({ title: 'ToDelete', recurrence: 'daily' });

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
    taskApi.createTask({ title: 'Workout', recurrence: 'daily', projectId: 'proj-1' });

    render(<DailiesClient />);

    // Should show 'Workout - (Health and Lifestyle)'
    const labeled = await screen.findByText('Workout - (Health and Lifestyle)');
    expect(labeled).toBeInTheDocument();
  });
});
