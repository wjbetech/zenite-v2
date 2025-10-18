import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import useDailyResetScheduler from '../useDailyResetScheduler';

function Harness({
  loadTasks,
  resetIfNeeded,
  resetNow,
}: {
  loadTasks: () => void;
  resetIfNeeded: () => void;
  resetNow: () => void;
}) {
  useDailyResetScheduler({ loadTasks, resetIfNeeded, resetNow });
  return <div />;
}

describe('useDailyResetScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'setTimeout');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('calls loadTasks and resetIfNeeded on mount and schedules resetNow at next midnight', () => {
    const loadTasks = jest.fn();
    const resetIfNeeded = jest.fn();
    const resetNow = jest.fn();

    render(<Harness loadTasks={loadTasks} resetIfNeeded={resetIfNeeded} resetNow={resetNow} />);

    // loadTasks and resetIfNeeded should be called immediately
    expect(loadTasks).toHaveBeenCalled();
    expect(resetIfNeeded).toHaveBeenCalled();

    // Advance timers to trigger the scheduled midnight reset
    // The hook uses window.setTimeout with ms until next midnight; ensure setTimeout was called
    expect(window.setTimeout).toHaveBeenCalled();

    // fast-forward all timers to trigger the scheduled reset
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(resetNow).toHaveBeenCalled();
  });

  it('re-runs resetIfNeeded when visibilitychange and focus events occur', () => {
    const loadTasks = jest.fn();
    const resetIfNeeded = jest.fn();
    const resetNow = jest.fn();

    render(<Harness loadTasks={loadTasks} resetIfNeeded={resetIfNeeded} resetNow={resetNow} />);

    // clear initial calls
    resetIfNeeded.mockClear();

    // dispatch visibilitychange
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(resetIfNeeded).toHaveBeenCalledTimes(1);

    // dispatch focus
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(resetIfNeeded).toHaveBeenCalledTimes(2);
  });
});
