import useTaskStore, { Task } from '../taskStore';
import useSettingsStore from '../settingsStore';

// Mock network API calls used by taskStore so tests run offline
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
const todayKey = () => new Date().toISOString().slice(0, 10);

beforeEach(() => {
  localStorage.clear();
  useTaskStore.setState({ tasks: [] });
  // default in tests
  useSettingsStore.getState().setDailyResetTime?.('04:00');
});

function makeTodayAt(hours: number, minutes = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return d;
}

test('does NOT reset before the configured daily-reset time', async () => {
  // enable fake timers so we can set system time for this test
  jest.useFakeTimers();
  try {
    // set system time to today at 02:30
    const fakeNow = makeTodayAt(2, 30);
    jest.setSystemTime(fakeNow);

    const createdAt = new Date().toISOString();
    const tasks: Task[] = [
      {
        id: 'daily-time-before',
        title: 'Daily Task Before Reset',
        createdAt,
        recurrence: 'daily',
        completed: true,
        started: true,
      },
    ];

    const { setTasks, resetDailiesIfNeeded } = useTaskStore.getState();
    setTasks(tasks);

    // set last reset to yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    localStorage.setItem(LAST_DAILY_RESET_KEY, yesterday);

    // configure reset time at 03:00
    useSettingsStore.getState().setDailyResetTime?.('03:00');

    await resetDailiesIfNeeded();

    const stateTasks = useTaskStore.getState().tasks;
    const daily = stateTasks.find((t) => t.id === 'daily-time-before');

    // should NOT have been reset yet
    expect(daily).toBeDefined();
    expect(daily?.completed).toBe(true);
    expect(localStorage.getItem(LAST_DAILY_RESET_KEY)).toBe(yesterday);
  } finally {
    jest.useRealTimers();
  }
});

test('resets when the configured daily-reset time has passed', async () => {
  // enable fake timers so we can set system time for this test
  jest.useFakeTimers();
  try {
    // set system time to today at 03:30 (after the 03:00 reset time)
    const fakeNow = makeTodayAt(3, 30);
    jest.setSystemTime(fakeNow);

    const createdAt = new Date().toISOString();
    const tasks: Task[] = [
      {
        id: 'daily-time-after',
        title: 'Daily Task After Reset',
        createdAt,
        recurrence: 'daily',
        completed: true,
        started: true,
      },
    ];

    const { setTasks, resetDailiesIfNeeded } = useTaskStore.getState();
    setTasks(tasks);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    localStorage.setItem(LAST_DAILY_RESET_KEY, yesterday);

    useSettingsStore.getState().setDailyResetTime?.('03:00');

    await resetDailiesIfNeeded();

    const stateTasks = useTaskStore.getState().tasks;
    const daily = stateTasks.find((t) => t.id === 'daily-time-after');

    expect(daily).toBeDefined();
    expect(daily?.completed).toBe(false);
    expect(daily?.started).toBe(false);
    expect(localStorage.getItem(LAST_DAILY_RESET_KEY)).toBe(todayKey());
  } finally {
    jest.useRealTimers();
  }
});
