// Minimal manual mock for @clerk/nextjs/server used by Jest tests
// Avoid importing Clerk's ESM runtime in tests.
const mockUser = {
  id: 'test_user',
  emailAddresses: [{ emailAddress: 'test@example.com', id: 'e1', primary: true, verified: true }],
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  imageUrl: null,
};

/**
 * Minimal auth() that returns a mocked logged-in user id.
 */
const auth = async () => ({ userId: mockUser.id, sessionId: 'session_test' });

/**
 * Returns a minimal Clerk-style user object.
 */
const currentUser = async () => mockUser;

/**
 * Minimal clerk client users namespace. JSDoc provides a type for the `id`
 * parameter to avoid implicit `any` when TypeScript inspects JS files.
 * @param {string} id
 */
const getUser = async (id) => ({ ...mockUser, id });

const clerkClient = { users: { getUser } };

// Minimal middleware helpers (no-op for tests)
/**
 * Minimal middleware mock. JSDoc types provided so TypeScript doesn't
 * complain about implicit `any` on parameters when checking JS files.
 * @returns {(req: unknown, res: unknown, next?: (...args: any[])=>void) => unknown}
 */
const clerkMiddleware = () => {
  /**
   * @param {unknown} req
   * @param {unknown} res
   * @param {Function} [next]
   */
  return (req, res, next) => {
    if (typeof next === 'function') next();
    return res;
  };
};

// createRouteMatcher accepts an array of patterns and returns a matcher fn.
const createRouteMatcher = () => () => false;

/** @template T
 * @param {T} handler
 * @returns {T}
 */
const withAuth = (handler) => handler;

module.exports = { auth, currentUser, clerkClient, withAuth, clerkMiddleware, createRouteMatcher };
