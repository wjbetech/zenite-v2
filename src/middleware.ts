import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health(.*)',
]);

// In development mode, allow API access without auth for testing
const isDev = process.env.NODE_ENV === 'development';

export default clerkMiddleware((auth, req) => {
  try {
    const request = req as NextRequest;

    // Skip auth protection for API routes in dev mode
    if (isDev && request.nextUrl?.pathname?.startsWith('/api/')) {
      return;
    }

    if (!isPublicRoute(req)) {
      auth().protect();
    }
  } catch (error) {
    console.error('Clerk middleware error:', error);
    // Let the error propagate but log it for debugging
    throw error;
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
