'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthRedirect() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    // avoid repeated pushes
    if (pushedRef.current) return;
    // don't redirect if already on dashboard or deeper dashboard routes
    if (!pathname) return;
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard')) return;
    pushedRef.current = true;
    router.push('/dashboard');
  }, [user, pathname, router]);

  return null;
}
