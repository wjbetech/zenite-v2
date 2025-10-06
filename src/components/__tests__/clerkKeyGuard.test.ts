import assertClerkKeySafe from '../clerkKeyGuard';

describe('clerkKeyGuard', () => {
  test('throws when prod-like env with test key', () => {
    expect(() => assertClerkKeySafe('pk_test_123', 'production')).toThrow(
      /Clerk publishable key appears to be a TEST key/,
    );
  });

  test('does not throw when prod-like env with live key', () => {
    expect(() => assertClerkKeySafe('pk_live_abc', 'production')).not.toThrow();
  });

  test('does not throw in development even with test key', () => {
    expect(() => assertClerkKeySafe('pk_test_123', 'development')).not.toThrow();
  });
});
