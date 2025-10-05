// Testable guard for Clerk publishable key usage.
export function assertClerkKeySafe(clerkKey: string, deployEnvRaw?: string) {
  const clerk = (clerkKey || '').toString();
  const deployEnv = (deployEnvRaw || '').toString().toLowerCase();
  const isProdLike = deployEnv === 'production' || deployEnv === 'staging' || deployEnv === 'prod';
  const looksLikeTestKey = /test|_test_|pk_test_|sk_test_/i.test(clerk);
  if (isProdLike && clerk && looksLikeTestKey) {
    throw new Error(
      `Clerk publishable key appears to be a TEST key while running in production-like environment (${deployEnv}). Set the live Clerk publishable key in your host environment variables and do not commit keys to the repo.`,
    );
  }
}

export default assertClerkKeySafe;
