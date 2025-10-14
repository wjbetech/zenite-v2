'use client';

import React from 'react';
import SettingsClient from '../../components/SettingsClient';
import ThemeDropdown from '../../components/ThemeDropdown';
import DashboardViewsSettings from '../../components/DashboardViewsSettings';
import PreferencesSettings from '../../components/PreferencesSettings';

export default function SettingsPage() {
  const sections = [
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
      id: 'preferences',
      title: 'Preferences',
      description: 'General app preferences: density, defaults, notifications, and privacy',
      render: <PreferencesSettings />,
    },
  ];

  return <SettingsClient sections={sections} />;
}
