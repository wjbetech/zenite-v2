// Test utility to mock selector-style Zustand hooks like `useTaskStore`
// Usage: const { setMockState, mockLoadTasks } = createUseTaskStoreMock(initialState)
// Then in tests: jest.mock('../lib/taskStore', () => createUseTaskStoreMock(state))

export function createUseTaskStoreMock(initialState = {}) {
  const state = {
    tasks: [],
    loading: false,
    error: null,
    loadTasks: jest.fn().mockResolvedValue(undefined),
    setTasks: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resetDailiesIfNeeded: jest.fn(),
    resetDailiesNow: jest.fn(),
    ...initialState,
  } as unknown;

  const mock = (selector: (s: unknown) => unknown) => selector(state as unknown);

  // expose for tests to mutate
  const setMockState = (next: Partial<Record<string, unknown>>) =>
    Object.assign(state as Record<string, unknown>, next);

  return { mock, state, setMockState };
}

export default createUseTaskStoreMock;
