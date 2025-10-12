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
