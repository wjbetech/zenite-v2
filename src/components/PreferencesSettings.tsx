'use client';

import React from 'react';
import useSettingsStore from '../lib/settingsStore';

// Small presentational subcomponents exported for use by the Settings page
// Display density is intentionally omitted — moved to a separate UX decision.
export function DisplayDensity() {
  const density = useSettingsStore((s) => s.density);
  const setDensity = useSettingsStore((s) => s.setDensity);

  return (
    <div>
      <div className="flex items-center gap-4 mt-2">
        <label className="flex items-center gap-2 form-control">
          <input
            type="radio"
            name="density"
            className="radio"
            checked={density === 'full'}
            onChange={() => setDensity('full')}
          />
          <span className="text-sm">Full</span>
        </label>

        <label className="flex items-center gap-2 form-control">
          <input
            type="radio"
            name="density"
            className="radio"
            checked={density === 'compact'}
            onChange={() => setDensity('compact')}
          />
          <span className="text-sm">Compact</span>
        </label>
      </div>
    </div>
  );
}

export function TaskCreationDefaults() {
  const taskDefaults = useSettingsStore((s) => s.taskDefaults);
  const setTaskDefaults = useSettingsStore((s) => s.setTaskDefaults);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        {/* Default priority removed per request */}

        <label className="flex flex-col">
          <span className="text-sm">Default recurrence</span>
          <div className="dropdown mt-1 self-start w-full max-w-sm">
            <label
              tabIndex={0}
              className="btn btn-outline border-2 w-full justify-between items-center text-sm px-3 h-10 flex mt-1.5 hover:border-2 hover:border-base-content"
              aria-haspopup="listbox"
              aria-expanded={false}
            >
              <span className="capitalize">{taskDefaults.defaultRecurrence ?? '(no default)'}</span>
              <svg
                className="ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              role="listbox"
              aria-label="Default recurrence options"
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full mt-2"
            >
              <li>
                <button
                  role="option"
                  aria-selected={taskDefaults.defaultRecurrence == null}
                  onClick={() => setTaskDefaults({ defaultRecurrence: null })}
                  className="flex items-center justify-between px-3 h-12 w-full text-sm capitalize hover:bg-base-200 rounded"
                >
                  <span>(no default)</span>
                </button>
              </li>
              {['once', 'daily', 'weekly'].map((r) => (
                <li key={r}>
                  <button
                    role="option"
                    aria-selected={taskDefaults.defaultRecurrence === r}
                    onClick={() =>
                      setTaskDefaults({ defaultRecurrence: r as 'once' | 'daily' | 'weekly' })
                    }
                    className="flex items-center justify-between px-3 h-12 w-full text-sm capitalize hover:bg-base-200 rounded"
                  >
                    <span>{r}</span>
                    {taskDefaults.defaultRecurrence === r && (
                      <svg
                        className="h-4 w-4 text-success"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </label>
        {/* Removed: Default due offset and Default project id per requested simplification */}
      </div>
    </div>
  );
}

export function TaskListSettings() {
  const showCompleted = useSettingsStore((s) => s.showCompleted);
  const setShowCompleted = useSettingsStore((s) => s.setShowCompleted);
  const dailyResetTime = useSettingsStore((s) => s.dailyResetTime);
  const setDailyResetTime = useSettingsStore((s) => s.setDailyResetTime);

  return (
    <div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox border-black"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
        />
        <span className="text-sm">Show completed tasks</span>
      </label>

      <div className="mt-4">
        <label className="flex flex-col">
          <span className="text-sm">Daily tasks reset time (local)</span>
          <input
            type="time"
            className="input input-sm mt-2 max-w-[10rem]"
            value={dailyResetTime ?? ''}
            onChange={(e) => setDailyResetTime(e.target.value || null)}
            aria-label="Daily reset time"
          />
          <span className="text-xs text-muted mt-1">
            When daily tasks roll over to not-started (local time).
          </span>
        </label>
      </div>
    </div>
  );
}

export function NotificationsSettings() {
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  return (
    <div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox border-black"
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
        <span className="text-sm">Enable local notifications (requires permission)</span>
      </label>
    </div>
  );
}

export function PrivacySettings() {
  const telemetryEnabled = useSettingsStore((s) => s.telemetryEnabled);
  const setTelemetryEnabled = useSettingsStore((s) => s.setTelemetryEnabled);
  const syncEnabled = useSettingsStore((s) => s.syncEnabled);
  const setSyncEnabled = useSettingsStore((s) => s.setSyncEnabled);

  return (
    <div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="checkbox border-black"
          checked={!telemetryEnabled}
          onChange={(e) => setTelemetryEnabled(!e.target.checked)}
        />
        <span className="text-sm">Opt-out of telemetry (analytics)</span>
      </label>
      <label className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          className="checkbox border-black"
          checked={syncEnabled}
          onChange={(e) => setSyncEnabled(e.target.checked)}
        />
        <span className="text-sm">Sync settings across devices (requires sign-in)</span>
      </label>
    </div>
  );
}

// Default historical export keeps the combined layout for consumers that import the file directly
export default function PreferencesSettings() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <DisplayDensity />
      <TaskCreationDefaults />
      <TaskListSettings />
      <NotificationsSettings />
      <PrivacySettings />
    </div>
  );
}
