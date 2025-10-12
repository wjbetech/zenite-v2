// Minimal manual mock for @clerk/nextjs/server used by Jest tests
// Avoid importing Clerk's ESM runtime in tests.
const mockUser = {
  id: 'test-user-1',
  emailAddresses: [
    { emailAddress: 'test@example.com', id: 'e1', primary: true, verified: true },
  ],
  firstName: 'Test',
  lastName: 'User',
};

module.exports = {
  auth: () => ({ userId: mockUser.id }),
  currentUser: async () => mockUser,
  clerkClient: {
    users: {
      getUser: async (id) => ({ ...mockUser, id }),
    },
  },
  // Minimal middleware helpers (no-op for tests)
  withAuth: (handler) => handler,
  clerkMiddleware: () => (req) => req,
};
// Minimal manual mock for @clerk/nextjs/server to avoid importing ESM runtime in Jest
const auth = async () => ({ userId: 'test_user', sessionId: 'session_test' });

const currentUser = async () => ({
  id: 'test_user',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  imageUrl: null,
});

const clerkMiddleware = () => (req, res, next) => {
  if (typeof next === 'function') next();
  return res;
};

const createRouteMatcher = () => () => false;

module.exports = { auth, currentUser, clerkMiddleware, createRouteMatcher };
