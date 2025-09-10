import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disable Clerk middleware while debugging headers() sync errors
// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

/** A minimal pass-through middleware to satisfy Next.js while debugging. */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
