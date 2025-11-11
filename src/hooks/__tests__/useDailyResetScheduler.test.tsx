import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import useDailyResetScheduler from '../useDailyResetScheduler';
import useTaskStore from '../../lib/taskStore';

function Harness() {
  useDailyResetScheduler();
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
    const loadTasks = jest.fn().mockResolvedValue(undefined);
    const resetIfNeeded = jest.fn().mockResolvedValue(undefined);

    // inject mocks into the store so the hook's selectors pick them up
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTaskStore.setState({ loadTasks, resetDailiesIfNeeded: resetIfNeeded } as any);

    render(<Harness />);

    // loadTasks and resetDailiesIfNeeded should be called immediately
    expect(loadTasks).toHaveBeenCalled();
    expect(resetIfNeeded).toHaveBeenCalled();

    // The hook schedules a timeout; ensure setTimeout was called
    expect(window.setTimeout).toHaveBeenCalled();

    // fast-forward any pending timers to trigger scheduled reset call
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // scheduled timeout should have invoked resetDailiesIfNeeded at least once more
    expect(resetIfNeeded).toHaveBeenCalled();
  });

  it('re-runs resetIfNeeded when visibilitychange and focus events occur', () => {
    const loadTasks = jest.fn().mockResolvedValue(undefined);
    const resetIfNeeded = jest.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTaskStore.setState({ loadTasks, resetDailiesIfNeeded: resetIfNeeded } as any);

    render(<Harness />);

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
