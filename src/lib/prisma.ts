import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// In production prefer a Render-provided connection string if present. Otherwise
// require DATABASE_URL to be set. This makes deployments fail fast if DB is
// misconfigured.
const getDatabaseUrl = () => {
  console.log('[prisma.ts] NODE_ENV:', process.env.NODE_ENV);
  console.log('[prisma.ts] DATABASE_URL:', process.env.DATABASE_URL ? '***set***' : '<EMPTY>');

  if (process.env.NODE_ENV === 'production') {
    const renderUrl = process.env.RENDER_DATABASE_URL ?? process.env.RENDER_DATABASE; // support alternate name
    const db = renderUrl ?? process.env.DATABASE_URL;

    // During CI or preview builds (e.g. Vercel preview) we sometimes build without a
    // production DB set. Allow build-time to proceed but still enforce the presence
    // of a DB at runtime in real production deploys. Use NEXT_PUBLIC_VERCEL_ENV or
    // a Render-provided env to detect true production.
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || '';
    const isVercelProduction = vercelEnv === 'production';

    if (!db && isVercelProduction) {
      throw new Error('DATABASE_URL (or RENDER_DATABASE_URL) must be set in production');
    }

    // Return whatever we have (may be undefined during preview build).
    return db;
  }
  // in non-production environments prefer explicit DATABASE_URL, fallback to sqlite or local
  return process.env.DATABASE_URL;
};

const prodUrl = getDatabaseUrl();

// If a specific URL was determined for production, prefer passing it to the
// PrismaClient constructor rather than embedding a `url` in the schema file
// (Prisma v7+ enforces this). We still set `process.env.DATABASE_URL` as a
// fallback so other tooling that reads the env continues to work.
const globalAny = global as unknown as { prisma?: PrismaClient };

if (prodUrl) {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? prodUrl;
}

// Build a minimal options object for PrismaClient. Newer Prisma versions
// support either `datasources` to override the `db` datasource, or
// `accelerateUrl` when using Prisma Accelerate. Detect `PRISMA_ACCELERATE_URL`
// and prefer it; otherwise supply the resolved DB URL as the `db` datasource.
const clientOptions: Record<string, unknown> = {};
if (process.env.PRISMA_ACCELERATE_URL) {
  clientOptions.accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
} else if (prodUrl || process.env.DATABASE_URL) {
  clientOptions.datasources = { db: prodUrl ?? process.env.DATABASE_URL };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = globalAny.prisma ?? new PrismaClient(clientOptions as any);

if (process.env.NODE_ENV !== 'production') globalAny.prisma = prisma;

// Helpful debug in production to confirm which DB URL is being used (masked).
if (process.env.NODE_ENV === 'production') {
  const url = process.env.RENDER_DATABASE_URL ?? process.env.DATABASE_URL ?? '';
  if (url) {
    const masked = url.replace(
      /(postgres(?:ql)?:\/\/)([^:@\/]+)(:[^@]+)?(@.*)/,
      (m, p1, user, pass, host) => {
        const u = user ? `${user}` : '***';
        return `${p1}${u}:***${host}`;
      },
    );
    // Use console.info to be visible in production logs
    console.info('Prisma will connect to:', masked);
  }
}

export default prisma;
export { prisma };

// Safety guard: prevent staging/production deployments from using a local/dev DATABASE_URL
const dbUrl = process.env.DATABASE_URL || '';
const envName = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || '';

if (envName === 'production' || envName === 'staging') {
  // simple local URL heuristics: localhost, 127.0.0.1, or postgres on local port
  if (dbUrl.match(/localhost|127\.0\.0\.1|postgres:password|:5432\//i)) {
    console.error(
      '\nFATAL: DATABASE_URL appears to be a local/development database while running in',
      envName,
    );
    console.error(
      'DATABASE_URL=',
      dbUrl ? dbUrl.replace(/(postgresql:\/\/.*@).*(:\d+)/, '$1<REDACTED>') : '<empty>',
    );
    throw new Error(
      'Unsafe DATABASE_URL for staging/production. Set DATABASE_URL to your Render/Postgres connection string.',
    );
  }
}
