'use client';

import React from 'react';
import SettingsClient from '../../components/SettingsView/SettingsClient';
import sections from '../../lib/settingsData';

export default function SettingsPage() {
  return <SettingsClient sections={sections} />;
}
