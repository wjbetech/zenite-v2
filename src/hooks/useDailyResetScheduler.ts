import { useEffect, useRef } from 'react';
import useSettingsStore from '../lib/settingsStore';
import useTaskStore from '../lib/taskStore';

function parseHHMM(src?: string | null) {
  if (!src) return null;
  const parts = src.split(':');
  if (parts.length < 2) return null;
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return { hh, mm };
}

export default function useDailyResetScheduler() {
  const dailyResetTime = useSettingsStore((s) => s.dailyResetTime);
  const resetDailiesIfNeeded = useTaskStore((s) => s.resetDailiesIfNeeded);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    function clearTimer() {
      if (timerRef.current != null) {
        try {
          clearTimeout(timerRef.current as unknown as number);
        } catch {}
        timerRef.current = null;
      }
    }

    function computeMsToNextReset() {
      const parsed = parseHHMM(dailyResetTime);
      const now = new Date();
      if (!parsed) {
        // no configured time: schedule 24h later to re-check
        return 24 * 60 * 60 * 1000;
      }
      const { hh, mm } = parsed;
      const target = new Date(now);
      target.setHours(hh, mm, 0, 0);
      if (now >= target) target.setDate(target.getDate() + 1);
      const ms = target.getTime() - now.getTime();
      return ms;
    }

    async function scheduleNext() {
      clearTimer();
      if (!mounted) return;
      const ms = computeMsToNextReset();
      if (!Number.isFinite(ms) || ms < 0) return;
      timerRef.current = window.setTimeout(async () => {
        try {
          await resetDailiesIfNeeded();
        } catch (e) {
          // ignore errors from reset
          void e;
        }
        // schedule again for the following boundary
        scheduleNext();
      }, ms) as unknown as number;
    }

    // ensure tasks loaded and run an immediate check on mount to handle missed resets
    try {
      void loadTasks();
    } catch {}
    resetDailiesIfNeeded().catch(() => {});
    scheduleNext();

    const onVisibility = () => {
      try {
        resetDailiesIfNeeded();
      } catch {}
    };
    const onFocus = () => {
      try {
        resetDailiesIfNeeded();
      } catch {}
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      mounted = false;
      clearTimer();
      try {
        document.removeEventListener('visibilitychange', onVisibility);
      } catch {}
      try {
        window.removeEventListener('focus', onFocus);
      } catch {}
    };
  }, [dailyResetTime, resetDailiesIfNeeded, loadTasks]);
}
