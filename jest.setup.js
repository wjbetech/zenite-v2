// Jest setup: provide a global fetch polyfill for tests
// Use node-fetch if available; otherwise provide a minimal mock
try {
  // prefer cross-fetch or node-fetch if installed
  const fetch = require('node-fetch');
  if (!global.fetch) global.fetch = fetch;
} catch (err) {
  // fallback: simple mock that throws so tests that expect mocked fetch must mock it
  if (!global.fetch) {
    global.fetch = () => {
      throw new Error('global.fetch is not implemented in this test environment. Please mock fetch in tests that require network calls.');
    };
  }
}

// Optional: silence React act warning by providing requestAnimationFrame in node
if (typeof global.requestAnimationFrame === 'undefined') {
  // @ts-ignore
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}
