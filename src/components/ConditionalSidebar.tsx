'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalSidebar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();

  // Hide sidebar on the root home page
  if (!pathname || pathname === '/') return null;

  return <Sidebar isLoggedIn={isLoggedIn} />;
}
