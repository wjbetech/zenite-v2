import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileCounts from './ProfileCounts';

export const metadata = {
  title: 'Profile - Zenite',
};

export default function ProfilePage() {
  return (
    <main className="m-6 mt-[124px] flex flex-col flex-1 min-h-0">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <ProfileHeader />

        <ProfileCounts />
      </div>
    </main>
  );
}
