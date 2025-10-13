'use client';

import React from 'react';
import SettingsClient from '../../components/SettingsClient';
import ThemeDropdown from '../../components/ThemeDropdown';

export default function SettingsPage() {
  const sections = [
    {
      id: 'theme',
      title: 'Theme',
      description: 'Choose your color scheme and theme settings',
      render: <ThemeDropdown />,
    },
  ];

  return <SettingsClient sections={sections} />;
}
