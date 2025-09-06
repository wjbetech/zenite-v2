'use client';

import React from 'react';
import ThemeDropdown from '../../components/ThemeDropdown';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Theme:</h2>
        <ThemeDropdown />
      </section>
    </div>
  );
}
