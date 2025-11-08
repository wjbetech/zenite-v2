import { jest } from '@jest/globals';

describe('ensureDailyResetOnLoad', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('calls resetDailiesIfNeeded once per session', async () => {
    const resetMock = jest.fn(async () => undefined);
    // mock the taskStore module that exposes getState
    jest.doMock('../taskStore', () => ({
      getState: () => ({ resetDailiesIfNeeded: resetMock }),
    }));

    const mod = await import('../dailyResetOnLoad');
    await mod.ensureDailyResetOnLoad();
    expect(resetMock).toHaveBeenCalledTimes(1);

    // calling again should not invoke the store method again
    await mod.ensureDailyResetOnLoad();
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  test('reset state can be cleared for tests and called again', async () => {
    const resetMock = jest.fn(async () => undefined);
    jest.doMock('../taskStore', () => ({
      getState: () => ({ resetDailiesIfNeeded: resetMock }),
    }));

    const mod = await import('../dailyResetOnLoad');
    await mod.ensureDailyResetOnLoad();
    expect(resetMock).toHaveBeenCalledTimes(1);

    // clear internal flag and call again
    mod._resetDailyResetOnLoadStateForTests();
    await mod.ensureDailyResetOnLoad();
    expect(resetMock).toHaveBeenCalledTimes(2);
  });
});
