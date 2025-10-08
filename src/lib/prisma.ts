import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// In production prefer a Render-provided connection string if present. Otherwise
// require DATABASE_URL to be set. This makes deployments fail fast if DB is
// misconfigured.
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const renderUrl = process.env.RENDER_DATABASE_URL ?? process.env.RENDER_DATABASE; // support alternate name
    const db = renderUrl ?? process.env.DATABASE_URL;
    if (!db) {
      throw new Error('DATABASE_URL (or RENDER_DATABASE_URL) must be set in production');
    }
    return db;
  }
  // in non-production environments prefer explicit DATABASE_URL, fallback to sqlite or local
  return process.env.DATABASE_URL;
};

const prodUrl = getDatabaseUrl();

// If a specific URL was determined for production, pass it to PrismaClient so
// it uses the intended datasource instead of relying on env at import-time.
const globalAny = global as unknown as { prisma?: PrismaClient };

// If prodUrl is present, ensure Prisma reads it from env (PrismaClient constructor
// reads process.env.DATABASE_URL). This avoids type gymnastics with the
// `datasources` constructor option.
if (prodUrl) {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? prodUrl;
}

const prisma = globalAny.prisma ?? new PrismaClient();

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
