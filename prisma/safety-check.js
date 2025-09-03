// Simple safety helper to ensure DATABASE_URL is not production before running risky Prisma commands

function assertLocal() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!/localhost|127\.0\.0\.1|::1|postgres/.test(dbUrl)) {
    console.error('Refusing to run: DATABASE_URL does not look local.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }
  if (/production|prod|zenite_prod|zenite_production/.test(dbUrl)) {
    console.error('Refusing to run: DATABASE_URL looks like production.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }
  console.log('DATABASE_URL looks safe for local/dev operations.');
}

if (require.main === module) {
  assertLocal();
}

module.exports = { assertLocal };
