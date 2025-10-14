'use client';

import { create } from 'zustand';

type TaskDefaults = {
  defaultProjectId?: string | null;
  defaultPriority?: 'low' | 'medium' | 'high' | null;
  defaultRecurrence?: 'once' | 'daily' | 'weekly' | null;
  defaultDueOffsetDays?: number | null; // e.g. 0 = today
};

type SettingsState = {
  // Dashboard view toggles
  newTasks: boolean;
  today: boolean;
  week: boolean;
  imminent: boolean;

  // UI density: full / compact
  density: 'full' | 'compact';

  // Task creation defaults
  taskDefaults: TaskDefaults;

  // Whether completed tasks are shown
  showCompleted: boolean;

  // Local notifications (client-side)
  notificationsEnabled: boolean;

  // Telemetry / analytics opt-in
  telemetryEnabled: boolean;

  // Sync settings across devices (server-sync, opt-in)
  syncEnabled: boolean;

  // setters
  setNewTasks: (v: boolean) => void;
  setToday: (v: boolean) => void;
  setWeek: (v: boolean) => void;
  setImminent: (v: boolean) => void;

  setDensity: (v: 'full' | 'compact') => void;
  setTaskDefaults: (v: Partial<TaskDefaults>) => void;
  setShowCompleted: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setTelemetryEnabled: (v: boolean) => void;
  setSyncEnabled: (v: boolean) => void;
};

const STORAGE_KEY = 'zenite.settings.v1';

function readInitial(): Omit<SettingsState, 'setNewTasks' | 'setToday' | 'setWeek' | 'setImminent' | 'setDensity' | 'setTaskDefaults' | 'setShowCompleted' | 'setNotificationsEnabled' | 'setTelemetryEnabled' | 'setSyncEnabled'> {
  try {
    if (typeof window === 'undefined')
      return {
        newTasks: true,
        today: true,
        week: true,
        imminent: true,
        density: 'full',
        taskDefaults: { defaultProjectId: null, defaultPriority: null, defaultRecurrence: null, defaultDueOffsetDays: null },
        showCompleted: false,
        notificationsEnabled: false,
        telemetryEnabled: true,
        syncEnabled: false,
      };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        newTasks: true,
        today: true,
        week: true,
        imminent: true,
        density: 'full',
        taskDefaults: { defaultProjectId: null, defaultPriority: null, defaultRecurrence: null, defaultDueOffsetDays: null },
        showCompleted: false,
        notificationsEnabled: false,
        telemetryEnabled: true,
        syncEnabled: false,
      };
    const parsed = JSON.parse(raw);
    return {
      newTasks: parsed.newTasks ?? true,
      today: parsed.today ?? true,
      week: parsed.week ?? true,
      imminent: parsed.imminent ?? true,
      density: parsed.density ?? 'full',
      taskDefaults: parsed.taskDefaults ?? { defaultProjectId: null, defaultPriority: null, defaultRecurrence: null, defaultDueOffsetDays: null },
      showCompleted: parsed.showCompleted ?? false,
      notificationsEnabled: parsed.notificationsEnabled ?? false,
      telemetryEnabled: parsed.telemetryEnabled ?? true,
      syncEnabled: parsed.syncEnabled ?? false,
    };
  } catch {
    return {
      newTasks: true,
      today: true,
      week: true,
      imminent: true,
      density: 'full',
      taskDefaults: { defaultProjectId: null, defaultPriority: null, defaultRecurrence: null, defaultDueOffsetDays: null },
      showCompleted: false,
      notificationsEnabled: false,
      telemetryEnabled: true,
      syncEnabled: false,
    };
  }
}

function persist(state: {
  newTasks: boolean;
  today: boolean;
  week: boolean;
  imminent: boolean;
  density: 'full' | 'compact';
  taskDefaults: TaskDefaults;
  showCompleted: boolean;
  notificationsEnabled: boolean;
  telemetryEnabled: boolean;
  syncEnabled: boolean;
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const useSettingsStore = create<SettingsState>((set) => {
  const initial = readInitial();

  return {
    newTasks: initial.newTasks,
    today: initial.today,
    week: initial.week,
    imminent: initial.imminent,
    density: initial.density,
    taskDefaults: initial.taskDefaults,
    showCompleted: initial.showCompleted,
    notificationsEnabled: initial.notificationsEnabled,
    telemetryEnabled: initial.telemetryEnabled,
    syncEnabled: initial.syncEnabled,

    setNewTasks: (v: boolean) =>
      set((s) => {
        try {
          persist({
            newTasks: v,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { newTasks: v } as Partial<SettingsState> as SettingsState;
      }),
    setToday: (v: boolean) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: v,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { today: v } as Partial<SettingsState> as SettingsState;
      }),
    setWeek: (v: boolean) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: v,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { week: v } as Partial<SettingsState> as SettingsState;
      }),
    setImminent: (v: boolean) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: v,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { imminent: v } as Partial<SettingsState> as SettingsState;
      }),

    setDensity: (v) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: v,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { density: v } as Partial<SettingsState> as SettingsState;
      }),

    setTaskDefaults: (v) =>
      set((s) => {
        const nextDefaults = { ...s.taskDefaults, ...v };
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: nextDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { taskDefaults: nextDefaults } as Partial<SettingsState> as SettingsState;
      }),

    setShowCompleted: (v) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: v,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { showCompleted: v } as Partial<SettingsState> as SettingsState;
      }),

    setNotificationsEnabled: (v) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: v,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { notificationsEnabled: v } as Partial<SettingsState> as SettingsState;
      }),

    setTelemetryEnabled: (v) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: v,
            syncEnabled: s.syncEnabled,
          });
        } catch {}
        return { telemetryEnabled: v } as Partial<SettingsState> as SettingsState;
      }),

    setSyncEnabled: (v) =>
      set((s) => {
        try {
          persist({
            newTasks: s.newTasks,
            today: s.today,
            week: s.week,
            imminent: s.imminent,
            density: s.density,
            taskDefaults: s.taskDefaults,
            showCompleted: s.showCompleted,
            notificationsEnabled: s.notificationsEnabled,
            telemetryEnabled: s.telemetryEnabled,
            syncEnabled: v,
          });
        } catch {}
        return { syncEnabled: v } as Partial<SettingsState> as SettingsState;
      }),
  };
});

export default useSettingsStore;
export { useSettingsStore };
