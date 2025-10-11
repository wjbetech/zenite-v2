import { auth, currentUser } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import prisma from './prisma';

const FALLBACK_OWNER_EMAIL = process.env.DEFAULT_TASK_OWNER_EMAIL ?? 'local@zenite.dev';
const FALLBACK_OWNER_NAME = process.env.DEFAULT_TASK_OWNER_NAME ?? 'Zenite Demo User';

/**
 * Gets the authenticated user's ID from the session.
 * If no session exists, returns the fallback demo user ID (for local dev).
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();

  // If we have a Clerk user ID, ensure there's a matching local user row.
  // If no local user exists (common in preview deployments where users
  // aren't synced to the DB), fall back to the demo user to avoid
  // foreign-key constraint errors when creating records that reference
  // users.
  if (userId) {
    try {
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (existing) return userId;
      // No matching local user row — fallthrough to fallback demo user
    } catch (err) {
      // any DB error — be conservative and use fallback demo user
      console.error('getAuthUserId: error checking local user existence', err);
    }
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
 * Ensures a local User row exists for the Clerk user by upserting from Clerk profile.
 * Use this in API routes that require strict authentication (no fallback).
 */
export async function requireAuth(): Promise<
  { userId: string; error: null } | { userId: null; error: NextResponse }
> {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Sync Clerk user to local DB to ensure ownerId FK constraint is satisfied
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? `clerk-${userId}@zenite.dev`;
      const name = clerkUser.firstName
        ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
        : clerkUser.username ?? email.split('@')[0];
      const avatarUrl = clerkUser.imageUrl ?? null;

      console.log('[requireAuth] Syncing Clerk user:', { userId, email, name });

      await prisma.$transaction(async (tx) => {
        const existingById = await tx.user.findUnique({ where: { id: userId } });
        if (existingById) {
          await tx.user.update({
            where: { id: userId },
            data: { email, name, avatarUrl },
          });
          return;
        }

        const existingByEmail = await tx.user.findUnique({ where: { email } });
        if (existingByEmail) {
          if (existingByEmail.id !== userId) {
            await tx.user.update({
              where: { email },
              data: {
                id: userId,
                name,
                avatarUrl,
              },
            });
          } else {
            await tx.user.update({ where: { id: userId }, data: { name, avatarUrl } });
          }
          return;
        }

        await tx.user.create({
          data: {
            id: userId,
            email,
            name,
            avatarUrl,
          },
        });
      });

      console.log('[requireAuth] User synced successfully:', userId);
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.error('requireAuth: unique constraint collision when syncing user', err.meta);
    }
    console.error('requireAuth: failed to sync Clerk user to local DB', err);
    // If sync fails, return error to avoid creating orphaned records
    return {
      userId: null,
      error: NextResponse.json({ error: 'User sync failed' }, { status: 500 }),
    };
  }

  return { userId, error: null };
}
