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
    // Defensive: in some test environments `useTaskStore` may be mocked
    // or replaced such that the exported value doesn't include a
    // `getState` function. Guard against that to avoid throwing a
    // TypeError which can cascade and make tests order-dependent.
    // Avoid using `any` to satisfy linter rules; cast to `unknown` and
    // inspect the `getState` property safely.
    if (
      !useTaskStore ||
      typeof (useTaskStore as unknown as { getState?: unknown }).getState !== 'function'
    ) {
      // nothing to do — safely return without error
      return;
    }

    const state = useTaskStore.getState();
    if (state && typeof state.resetDailiesIfNeeded === 'function') {
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
