import React from 'react';
import ThemeDropdown from '../components/ThemeDropdown';
import DashboardViewsSettings from '@/components/DashboardView/DashboardViewsSettings';
import {
  TaskCreationDefaults,
  TaskListSettings,
  NotificationsSettings,
  PrivacySettings,
} from '../components/SettingsView/PreferencesSettings';
import { DisplayDensity } from '../components/SettingsView/PreferencesSettings';

export const sections = [
  {
    id: 'theme',
    title: 'Theme',
    description: 'Choose your color scheme and theme settings',
    render: <ThemeDropdown />,
  },
  {
    id: 'dashboard_views',
    title: 'Dashboard Views',
    description: 'Toggle which sections are visible in your Dashboard',
    render: <DashboardViewsSettings />,
  },
  {
    id: 'display',
    title: 'Display',
    description: 'Choose compact or full spacing for task lists.',
    render: <DisplayDensity />,
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Task creation defaults and task list settings',
    render: (
      <div className="grid grid-cols-1 gap-4">
        <TaskCreationDefaults />
        <TaskListSettings />
      </div>
    ),
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Local notification preferences',
    render: <NotificationsSettings />,
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Telemetry and sync behavior',
    render: <PrivacySettings />,
  },
];

export default sections;
