import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import useSettingsStore from '../settingsStore';
import useTaskStore, { Task } from '../taskStore';
import useDailyResetScheduler from '../../hooks/useDailyResetScheduler';

// mock api module used by taskStore
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    updateTask: jest.fn().mockResolvedValue({}),
    createTask: jest.fn().mockResolvedValue({}),
    fetchTasks: jest.fn().mockResolvedValue([]),
    deleteTask: jest.fn().mockResolvedValue({}),
  },
}));

const LAST_DAILY_RESET_KEY = 'zenite:dailies:lastReset:v1';

function TestHarness() {
  useDailyResetScheduler();
  return null;
}

function makeTodayAt(h: number, m = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
}

beforeEach(() => {
  localStorage.clear();
  useTaskStore.setState({ tasks: [] });
  useSettingsStore.getState().setDailyResetTime?.('03:00');
});

test('scheduler triggers reset when time passes while app is open', async () => {
  jest.useFakeTimers();
  try {
    // set clock to 02:50
    const now = makeTodayAt(2, 50);
    jest.setSystemTime(now);

    const createdAt = new Date().toISOString();
    const tasks: Task[] = [
      { id: 'sched-1', title: 't', createdAt, recurrence: 'daily', completed: true, started: true },
    ];

    const { setTasks } = useTaskStore.getState();
    setTasks(tasks);
    // prevent the hook from auto-loading remote tasks which would overwrite our seeded tasks
    useTaskStore.setState({ loadTasks: async () => {} });

    // last reset was yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    localStorage.setItem(LAST_DAILY_RESET_KEY, yesterday);

    // mount harness which schedules the timer
    await act(async () => {
      render(<TestHarness />);
    });

    // advance 20 minutes to 03:10 — should have fired at 03:00
    await act(async () => {
      jest.advanceTimersByTime(20 * 60 * 1000);
      // allow any pending promises/microtasks to run
      await Promise.resolve();
    });

    const t = useTaskStore.getState().tasks.find((x) => x.id === 'sched-1');
    expect(t).toBeDefined();
    expect(t?.completed).toBe(false);
  } finally {
    jest.useRealTimers();
  }
});

test('scheduler handles a forward clock jump (DST-like) by triggering reset once clock shows past reset time', async () => {
  // This test simulates a sudden clock jump: app was at 02:50 then system clock jumps to 03:30
  jest.useFakeTimers();
  try {
    const before = makeTodayAt(2, 50);
    jest.setSystemTime(before);

    const createdAt = new Date().toISOString();
    const tasks: Task[] = [
      {
        id: 'sched-2',
        title: 't2',
        createdAt,
        recurrence: 'daily',
        completed: true,
        started: true,
      },
    ];
    useTaskStore.getState().setTasks(tasks);
    useTaskStore.setState({ loadTasks: async () => {} });
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    localStorage.setItem(LAST_DAILY_RESET_KEY, yesterday);

    await act(async () => {
      render(<TestHarness />);
    });

    // jump the system clock forward to 03:30
    const after = makeTodayAt(3, 30);
    jest.setSystemTime(after);

    // call resetDailiesIfNeeded manually as visibility/focus handlers would do
    await act(async () => {
      await useTaskStore.getState().resetDailiesIfNeeded();
    });

    const t = useTaskStore.getState().tasks.find((x) => x.id === 'sched-2');
    expect(t).toBeDefined();
    expect(t?.completed).toBe(false);
  } finally {
    jest.useRealTimers();
  }
});
