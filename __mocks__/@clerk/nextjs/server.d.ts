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
  export function clerkMiddleware(): any;
  export function createRouteMatcher(): (url: string) => boolean;
}
