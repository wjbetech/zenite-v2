// Compatibility shim: delegate to ESM `seed-reset.mjs` when run with Node.
// Keeps a JS entrypoint for tooling while avoiding CommonJS `require()`.
(async () => {
  try {
    // dynamic import avoids static CommonJS require usage
    // (Node will resolve `.mjs` in the same folder)
    await import('./seed-reset.mjs');
  } catch (err) {
    console.error('Failed to run seed-reset.mjs:', err);
    process.exit(1);
  }
})();
