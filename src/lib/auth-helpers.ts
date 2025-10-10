import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';
import prisma from './prisma';

const FALLBACK_OWNER_EMAIL = process.env.DEFAULT_TASK_OWNER_EMAIL ?? 'local@zenite.dev';
const FALLBACK_OWNER_NAME = process.env.DEFAULT_TASK_OWNER_NAME ?? 'Zenite Demo User';

/**
 * Gets the authenticated user's ID from the session.
 * If no session exists, returns the fallback demo user ID (for local dev).
 */
export async function getAuthUserId(): Promise<string> {
  const session = await getServerSession(authOptions);

  // If we have a session with user ID, return it
  if (session?.user && (session.user as any).id) {
    return (session.user as any).id;
  }

  // Fallback to demo user for local development
  const fallback = await prisma.user.upsert({
    where: { email: FALLBACK_OWNER_EMAIL },
    update: {},
    create: { email: FALLBACK_OWNER_EMAIL, name: FALLBACK_OWNER_NAME },
  });
  return fallback.id;
}

/**
 * Gets the authenticated user's ID or returns an error response if not authenticated.
 * Use this in API routes that require strict authentication (no fallback).
 */
export async function requireAuth(): Promise<
  { userId: string; error: null } | { userId: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return {
      userId: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { userId: (session.user as any).id, error: null };
}
