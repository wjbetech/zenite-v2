'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const pushedRef = useRef(false);

  useEffect(() => {
    // wait until Clerk has loaded the auth state
    if (!isLoaded) return;
    // only redirect when the user is actually signed in
    if (!isSignedIn) return;
    // avoid repeated pushes
    if (pushedRef.current) return;
    // don't redirect if already on dashboard or deeper dashboard routes
    if (!pathname) return;
    // Only auto-redirect when the user explicitly navigated to an auth/signin
    // page or the dedicated sign-in routes. We intentionally avoid redirecting
    // users who land on the root (`/`) so that returning users can stay on the
    // landing page or be routed by server-side logic.
    const shouldRedirectToDashboard =
      pathname === '/signin' ||
      pathname === '/sign-in' ||
      pathname === '/auth' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/sign-in');

    if (!shouldRedirectToDashboard) return;

    pushedRef.current = true;
    router.push('/dashboard');
  }, [isLoaded, isSignedIn, pathname, router]);

  return null;
}
