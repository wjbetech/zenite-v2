import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityHeatmap from '../src/components/ActivityTracker/ActivityHeatmap';

function localIso(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('ActivityHeatmap', () => {
  test('uncontrolled open/close toggle shows and hides the panel', () => {
    render(<ActivityHeatmap />);

    // Initially closed: the expand button should be present (aria-label)
    const toggle = screen.getByRole('button', { name: /expand activity tracker/i });
    expect(toggle).toBeInTheDocument();

    // Open
    fireEvent.click(toggle);
    // range buttons should be visible when open
    expect(screen.getByText(/3 months/i)).toBeInTheDocument();

    // Close: verify the collapse button indicates aria-expanded=false
    const collapse = screen.getByRole('button', { name: /collapse activity tracker/i });
    fireEvent.click(collapse);
    expect(collapse).toHaveAttribute('aria-expanded', 'false');
  });

  test('reacts to activity prop updates and highlights non-empty day', () => {
    const today = new Date();
    const key = localIso(today);
    const activity = { [key]: 2 };

    // Controlled open so the panel renders immediately
    render(<ActivityHeatmap open={true} activity={activity} />);

    // There should be at least one element with a non-empty color class
    // for count=2 the heatmap uses the second color (index 1) -> 'bg-success/30'
    const buttons = screen.getAllByRole('button');
    const colored = buttons.find((b: unknown) =>
      (b as { className?: string }).className?.includes('bg-success/30'),
    );
    expect(colored).toBeDefined();
  });
});
