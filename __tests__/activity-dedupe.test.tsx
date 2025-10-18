import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../src/components/DashboardView/Dashboard';

// Helper to format local YYYY-MM-DD
function localIso(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('Activity deduplication (Dashboard)', () => {
  beforeEach(() => {
    // Clear any stored snapshots
    try {
      window.localStorage.clear();
    } catch {}
  });

  test('ensures each activity square shows unique task titles when server returns duplicates', async () => {
    const today = new Date();
    const key = localIso(today);

    // Mock /api/activity to return duplicated rows (same title twice)
    global.fetch = jest.fn((url: string) => {
      if (String(url).includes('/api/activity')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { date: key, taskTitle: 'Dup Task', taskId: 't1' },
              { date: key, taskTitle: 'Dup Task', taskId: 't2' },
            ]),
        } as unknown as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as unknown as Response);
    }) as unknown as jest.Mock;

    render(<Dashboard />);

    // Open the activity tracker
    const expand = await screen.findByRole('button', { name: /expand activity tracker/i });
    fireEvent.click(expand);

    // Wait for activity tiles to render and then find a day button with completed in aria-label
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const dayButton = buttons.find((b) =>
        (b.getAttribute('aria-label') || '').includes('completed'),
      );
      expect(dayButton).toBeDefined();
      // Hover to cause tooltip to appear
      fireEvent.mouseEnter(dayButton!);
    });

    // The ActivityHeatmap exposes a hidden test-only element containing
    // the titles for a day when NODE_ENV==='test'. Query that element
    // and assert it contains a single title (deduped).
    await waitFor(() => {
      const el = document.querySelector(`[data-testid=\"activity-titles-${key}\"]`);
      if (!el) throw new Error('activity titles element not found');
      const spans = Array.from(el.querySelectorAll('span')) as HTMLSpanElement[];
      const texts = spans.map((s) => s.textContent);
      expect(texts.filter((t) => t === 'Dup Task').length).toBe(1);
    });
  });
});
