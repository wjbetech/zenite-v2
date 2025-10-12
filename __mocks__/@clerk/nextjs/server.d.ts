declare module '@clerk/nextjs/server' {
  export function auth(): Promise<{ userId?: string | null; sessionId?: string | null }>;
  export function currentUser(): Promise<{
    id: string;
    emailAddresses?: { emailAddress: string }[];
    firstName?: string;
    lastName?: string;
    username?: string;
    imageUrl?: string | null;
  } | null>;
  // clerkMiddleware accepts a handler function (auth helper and request)
  // and returns an unknown middleware result. Avoid `any` to satisfy lint.
  export function clerkMiddleware(
    handler: (auth: () => { protect: () => void }, req: unknown) => unknown,
  ): unknown;
  export function createRouteMatcher(): (url: string) => boolean;
}
