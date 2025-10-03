import useTaskStore, { Task } from '../taskStore';


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
  // Jest runs in jsdom so localStorage is available. Clear it and reset store state.
  localStorage.clear();
  useTaskStore.setState({ tasks: [] });
});

test('resetDailiesNow resets completed/started for daily tasks and sets last-reset key', async () => {
  const createdAt = new Date().toISOString();
  const tasks: Task[] = [
    {
      id: 'daily-1',
      title: 'Daily Task',
      createdAt,
      recurrence: 'daily',
      completed: true,
      started: true,
    },
    {
      id: 'once-1',
      title: 'Once Task',
      createdAt,
      recurrence: 'once',
      completed: true,
      started: true,
    },
  ];

  // seed tasks directly in the store (avoid createTask network path)
  const { setTasks, resetDailiesNow } = useTaskStore.getState();
  setTasks(tasks);

  // call the helper under test and await
  await resetDailiesNow();

  const stateTasks = useTaskStore.getState().tasks;
  const daily = stateTasks.find((t) => t.id === 'daily-1');
  const once = stateTasks.find((t) => t.id === 'once-1');

  expect(daily).toBeDefined();
  expect(daily?.completed).toBe(false);
  expect(daily?.started).toBe(false);

  // non-daily completed tasks are snapshot and removed during reset
  expect(once).toBeUndefined();

  // last reset key should be set to today's date
  expect(localStorage.getItem(LAST_DAILY_RESET_KEY)).toBe(todayKey());
});

test('resetDailiesIfNeeded triggers only when last reset is not today', async () => {
  const createdAt = new Date().toISOString();
  const tasks: Task[] = [
    {
      id: 'daily-2',
      title: 'Daily Task 2',
      createdAt,
      recurrence: 'daily',
      completed: true,
      started: true,
    },
  ];

  const { setTasks, resetDailiesIfNeeded } = useTaskStore.getState();
  setTasks(tasks);

  // set last reset to yesterday to force a reset
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  localStorage.setItem(LAST_DAILY_RESET_KEY, yesterday);

  // call and await to ensure the async reset runs
  await resetDailiesIfNeeded();

  const daily = useTaskStore.getState().tasks.find((t) => t.id === 'daily-2');
  expect(daily).toBeDefined();
  expect(daily?.completed).toBe(false);
  expect(localStorage.getItem(LAST_DAILY_RESET_KEY)).toBe(todayKey());
});
