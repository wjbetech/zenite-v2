import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileCounts from './ProfileCounts';

export const metadata = {
  title: 'Profile - Zenite',
};

export default function ProfilePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <ProfileHeader />

      <ProfileCounts />
    </main>
  );
}
