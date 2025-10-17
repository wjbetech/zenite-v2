// Minimal helpers for extracting a lightweight user shape from Clerk's server user
// object. Kept small and defensive so callers don't need to use `any`.

export type MinimalClerkUser = {
  fullName?: string | null;
  imageUrl?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }> | null;
};

export function toInitialUser(
  u: unknown,
): { fullName?: string; imageUrl?: string; email?: string } | undefined {
  if (!u || typeof u !== 'object') return undefined;
  const cu = u as MinimalClerkUser;
  const fullName = typeof cu.fullName === 'string' ? cu.fullName : undefined;
  const imageUrl = typeof cu.imageUrl === 'string' ? cu.imageUrl : undefined;

  const primaryEmail =
    cu.primaryEmailAddress && typeof cu.primaryEmailAddress.emailAddress === 'string'
      ? cu.primaryEmailAddress.emailAddress
      : undefined;

  const fallbackEmail =
    Array.isArray(cu.emailAddresses) &&
    cu.emailAddresses[0] &&
    typeof cu.emailAddresses[0].emailAddress === 'string'
      ? cu.emailAddresses[0].emailAddress
      : undefined;

  const email = primaryEmail || fallbackEmail || undefined;
  return { fullName, imageUrl, email };
}
