declare module '@clerk/nextjs/server' {
  export type ClerkUser = {
    id: string;
    emailAddresses?: Array<{ emailAddress: string }>;
    firstName?: string;
    lastName?: string;
    username?: string;
    imageUrl?: string | null;
  };

  export function auth(): Promise<{ userId?: string | null; sessionId?: string | null }>;
  export function currentUser(): Promise<ClerkUser | null>;

  export const clerkClient: {
    users: {
      getUser: (id: string) => Promise<ClerkUser>;
    };
  };

  export function withAuth<T>(handler: T): T;

  // createRouteMatcher accepts an array of route globs and returns a matcher
  // function that accepts the request (or path) and returns a boolean.
  export function createRouteMatcher(patterns: string[]): (req: unknown) => boolean;

  // clerkMiddleware wraps a handler. The handler receives an `auth` helper
  // (callable) and the request. We use conservative unknown types here to
  // satisfy the typechecker without over-specifying the mock surface.
  export function clerkMiddleware(
    handler: (auth: () => { protect: () => void }, req: unknown) => unknown,
  ): unknown;
}
