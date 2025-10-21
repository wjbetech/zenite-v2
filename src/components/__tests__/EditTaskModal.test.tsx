import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditTaskModal from '../modals/EditTaskModal';
import type { Task } from '../../lib/taskStore';

describe('EditTaskModal', () => {
  it('parses HH:MM input into estimatedDuration minutes on save', () => {
    const mockTask: Task = {
      id: 't1',
      title: 'Test',
      notes: null,
      projectId: null,
    } as unknown as Task;

    const handleSave = jest.fn();
    const handleOpenChange = jest.fn();

    render(
      <EditTaskModal
        open={true}
        onOpenChange={handleOpenChange}
        task={mockTask}
        onSave={handleSave}
      />,
    );

    // find the hours and minutes inputs by label
    const hoursInput = screen.getByLabelText(/estimated duration hours/i) as HTMLInputElement;
    const minsInput = screen.getByLabelText(/estimated duration minutes/i) as HTMLInputElement;
    expect(hoursInput).toBeTruthy();
    expect(minsInput).toBeTruthy();

    // set time to 1 hour 30 minutes => 90 minutes
    fireEvent.change(hoursInput, { target: { value: '1' } });
    fireEvent.change(minsInput, { target: { value: '30' } });

    // submit the form - find Save button
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    // onSave should be called with id and patch containing estimatedDuration: 90
    expect(handleSave).toHaveBeenCalledTimes(1);
    const call = handleSave.mock.calls[0] as unknown as [string, Partial<Task>];
    const id = call[0];
    const patch = call[1];
    expect(id).toBe('t1');
    expect(patch).toBeTruthy();
    const maybe = patch as unknown as { estimatedDuration?: number };
    expect(maybe.estimatedDuration).toBe(90);
  });
});
