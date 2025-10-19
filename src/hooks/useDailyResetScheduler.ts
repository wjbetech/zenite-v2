import { useEffect } from 'react';

export default function useDailyResetScheduler({
  loadTasks,
  resetIfNeeded,
  resetNow,
}: {
  loadTasks: () => void | Promise<void>;
  resetIfNeeded: () => void;
  resetNow: () => void;
}) {
  useEffect(() => {
    // Ensure tasks are loaded when visiting Dailies.
    void loadTasks();

    // initial check
    try {
      resetIfNeeded();
    } catch (e) {
      // preserve existing behavior of logging errors
      console.error('error running resetIfNeeded', e);
    }

    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      const ms = next.getTime() - now.getTime();
      timeoutId = window.setTimeout(() => {
        try {
          resetNow();
        } catch (e) {
          console.error('error running resetNow', e);
        }
        // schedule again for the following midnight
        scheduleNext();
      }, ms);
    };

    scheduleNext();

    const onVisibility = () => resetIfNeeded();
    const onFocus = () => resetIfNeeded();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadTasks, resetIfNeeded, resetNow]);
}
