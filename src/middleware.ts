import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disable Clerk middleware while debugging headers() sync errors
// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

/** A minimal pass-through middleware to satisfy Next.js while debugging. */
export function middleware(req: NextRequest) {
  try {
    // Forward request headers to mark the parameter as used (no behavior change)
    return NextResponse.next({ request: { headers: req.headers } });
  } catch (err) {
    // Log the full error (stack when available) so Vercel logs capture the cause.
    const msg = err instanceof Error ? err.stack ?? err.message : String(err);
    // Use console.error so it's visible in platform logs
    console.error('Middleware invocation error:', msg);
    // Don't rethrow — allow the request to continue to avoid a hard 500 caused by middleware
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
