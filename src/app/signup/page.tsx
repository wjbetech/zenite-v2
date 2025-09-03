'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  useEffect(() => {
    signIn('google');
  }, []);

  return <div className="p-6">Redirecting to Google sign-up…</div>;
}
