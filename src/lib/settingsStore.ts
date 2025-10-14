'use client';

import { create } from 'zustand';

type DashboardViewsState = {
  newTasks: boolean;
  today: boolean;
  week: boolean;
  imminent: boolean;
  setNewTasks: (v: boolean) => void;
  setToday: (v: boolean) => void;
  setWeek: (v: boolean) => void;
  setImminent: (v: boolean) => void;
};

const STORAGE_KEY = 'zenite.dashboard.views';

function readInitial(): { newTasks: boolean; today: boolean; week: boolean; imminent: boolean } {
  try {
    if (typeof window === 'undefined')
      return { newTasks: true, today: true, week: true, imminent: true };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { newTasks: true, today: true, week: true, imminent: true };
    const parsed = JSON.parse(raw);
    return {
      newTasks: parsed.newTasks ?? true,
      today: parsed.today ?? true,
      week: parsed.week ?? true,
      imminent: parsed.imminent ?? true,
    };
  } catch {
    return { newTasks: true, today: true, week: true, imminent: true };
  }
}

function persist(state: { newTasks: boolean; today: boolean; week: boolean; imminent: boolean }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const useSettingsStore = create<DashboardViewsState>((set) => {
  const initial = readInitial();

  return {
    newTasks: initial.newTasks,
    today: initial.today,
    week: initial.week,
    imminent: initial.imminent,
    setNewTasks: (v: boolean) =>
      set((s) => {
        const nextState = { newTasks: v, today: s.today, week: s.week, imminent: s.imminent };
        try {
          persist(nextState);
        } catch {}
        return { newTasks: v } as Partial<DashboardViewsState> as DashboardViewsState;
      }),
    setToday: (v: boolean) =>
      set((s) => {
        const nextState = { newTasks: s.newTasks, today: v, week: s.week, imminent: s.imminent };
        try {
          persist(nextState);
        } catch {}
        return { today: v } as Partial<DashboardViewsState> as DashboardViewsState;
      }),
    setWeek: (v: boolean) =>
      set((s) => {
        const nextState = { newTasks: s.newTasks, today: s.today, week: v, imminent: s.imminent };
        try {
          persist(nextState);
        } catch {}
        return { week: v } as Partial<DashboardViewsState> as DashboardViewsState;
      }),
    setImminent: (v: boolean) =>
      set((s) => {
        const nextState = { newTasks: s.newTasks, today: s.today, week: s.week, imminent: v };
        try {
          persist(nextState);
        } catch {}
        return { imminent: v } as Partial<DashboardViewsState> as DashboardViewsState;
      }),
  };
});

export default useSettingsStore;
export { useSettingsStore };
