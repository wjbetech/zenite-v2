import React from 'react';
import ProfileHeader from './ProfileHeader';

export const metadata = {
  title: 'Profile - Zenite',
};

export default function ProfilePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <ProfileHeader />

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recent projects</h2>
        <p className="text-sm text-muted-foreground">(Coming soon — DB integration)</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Recent tasks</h2>
        <p className="text-sm text-muted-foreground">(Coming soon — DB integration)</p>
      </section>
    </main>
  );
}
