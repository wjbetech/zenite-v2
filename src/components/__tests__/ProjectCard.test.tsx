import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectCard from '../ProjectCard';

describe('ProjectCard (smoke)', () => {
  it('renders without crashing and shows name', () => {
    const project = { id: 'p1', name: 'Test Project', description: 'desc' } as const;
    // ProjectCard expects { id, name, description? }
    render(
      React.createElement(ProjectCard, {
        project: project as unknown as { id: string; name: string; description?: string },
      }),
    );
    expect(screen.getByText('Test Project')).toBeTruthy();
  });

  it('renders delete button when onDelete provided and calls it', () => {
    const project = { id: 'p1', name: 'Test Project' } as const;
    const onDelete = jest.fn();
    render(
      React.createElement(ProjectCard, {
        project: project as unknown as { id: string; name: string },
        onDelete,
      }),
    );
    const btn = screen.getByRole('button', { name: /delete project/i });
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalledWith('p1');
  });
});
