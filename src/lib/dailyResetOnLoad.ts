// Lightweight helper to ensure daily reset runs at least once per client session
// across pages that render task UI. It calls the existing store method
// `resetDailiesIfNeeded` and guards with a module-level flag so multiple
// mounts don't trigger repeated checks.
import useTaskStore from './taskStore';

let hasRunThisSession = false;

export async function ensureDailyResetOnLoad(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (hasRunThisSession) return;
  hasRunThisSession = true;
  try {
    const state = useTaskStore.getState();
    if (typeof state.resetDailiesIfNeeded === 'function') {
      await state.resetDailiesIfNeeded();
    }
  } catch (err) {
    // swallow — this should never block rendering
    console.error('ensureDailyResetOnLoad failed', err);
  }
}

// exposed for tests to reset the module flag
export function _resetDailyResetOnLoadStateForTests() {
  hasRunThisSession = false;
}
