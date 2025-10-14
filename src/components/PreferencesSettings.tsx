'use client';

import React from 'react';
import useSettingsStore from '../lib/settingsStore';

export default function PreferencesSettings() {
  const density = useSettingsStore((s) => s.density);
  const setDensity = useSettingsStore((s) => s.setDensity);

  const taskDefaults = useSettingsStore((s) => s.taskDefaults);
  const setTaskDefaults = useSettingsStore((s) => s.setTaskDefaults);

  const showCompleted = useSettingsStore((s) => s.showCompleted);
  const setShowCompleted = useSettingsStore((s) => s.setShowCompleted);

  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  const telemetryEnabled = useSettingsStore((s) => s.telemetryEnabled);
  const setTelemetryEnabled = useSettingsStore((s) => s.setTelemetryEnabled);

  const syncEnabled = useSettingsStore((s) => s.syncEnabled);
  const setSyncEnabled = useSettingsStore((s) => s.setSyncEnabled);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h3 className="text-lg font-semibold">Display density</h3>
        <p className="text-sm text-base-content/60 mb-2">Choose compact or full spacing for task lists.</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="density" checked={density === 'full'} onChange={() => setDensity('full')} />
            <span className="text-sm">Full</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="density" checked={density === 'compact'} onChange={() => setDensity('compact')} />
            <span className="text-sm">Compact</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Task creation defaults</h3>
        <p className="text-sm text-base-content/60 mb-2">Defaults applied when creating a new task.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col">
            <span className="text-sm">Default priority</span>
            <select
              className="select w-full max-w-xs mt-1"
              value={taskDefaults.defaultPriority ?? ''}
              onChange={(e) => setTaskDefaults({ defaultPriority: e.target.value ? (e.target.value as 'low' | 'medium' | 'high') : null })}
            >
              <option value="">(no default)</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Default recurrence</span>
            <select
              className="select w-full max-w-xs mt-1"
              value={taskDefaults.defaultRecurrence ?? ''}
              onChange={(e) => setTaskDefaults({ defaultRecurrence: e.target.value ? (e.target.value as 'once' | 'daily' | 'weekly') : null })}
            >
              <option value="">(no default)</option>
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Default due offset (days)</span>
            <input
              type="number"
              className="input w-full max-w-xs mt-1"
              value={taskDefaults.defaultDueOffsetDays ?? ''}
              onChange={(e) => setTaskDefaults({ defaultDueOffsetDays: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Default project id</span>
            <input
              type="text"
              className="input w-full max-w-xs mt-1"
              value={taskDefaults.defaultProjectId ?? ''}
              onChange={(e) => setTaskDefaults({ defaultProjectId: e.target.value === '' ? null : e.target.value })}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Task list</h3>
        <p className="text-sm text-base-content/60 mb-2">Control which tasks are shown by default.</p>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          <span className="text-sm">Show completed tasks</span>
        </label>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-base-content/60 mb-2">Enable local browser notifications for reminders (requires permission).</p>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="checkbox"
            checked={notificationsEnabled}
            onChange={async (e) => {
              const enabled = e.target.checked;
              if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
                try {
                  const perm = await Notification.requestPermission();
                  if (perm !== 'granted') {
                    // user denied; keep checkbox off
                    setNotificationsEnabled(false);
                    return;
                  }
                } catch {
                  setNotificationsEnabled(false);
                  return;
                }
              }
              setNotificationsEnabled(enabled);
            }}
          />
          <span className="text-sm">Enable local notifications</span>
        </label>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Privacy</h3>
        <p className="text-sm text-base-content/60 mb-2">Control telemetry and sync behavior.</p>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="checkbox" checked={!telemetryEnabled} onChange={(e) => setTelemetryEnabled(!e.target.checked)} />
          <span className="text-sm">Opt-out of telemetry (analytics)</span>
        </label>
        <label className="flex items-center gap-3 mt-2">
          <input type="checkbox" className="checkbox" checked={syncEnabled} onChange={(e) => setSyncEnabled(e.target.checked)} />
          <span className="text-sm">Sync settings across devices (requires sign-in)</span>
        </label>
      </div>
    </div>
  );
}
