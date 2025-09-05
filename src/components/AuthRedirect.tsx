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
    // Only auto-redirect when the user landed on the root or an auth/signin page.
    // This prevents forcing navigation when the user intentionally visits other routes
    // (for example, /dailies or /projects) before client auth hydrates.
    const shouldRedirect =
      pathname === '/' ||
      pathname === '/signin' ||
      pathname === '/sign-in' ||
      pathname === '/auth' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/sign-in');

    if (!shouldRedirect) return;

    pushedRef.current = true;
    router.push('/dashboard');
  }, [isLoaded, isSignedIn, pathname, router]);

  return null;
}
