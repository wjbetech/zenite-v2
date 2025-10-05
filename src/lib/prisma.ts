import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;

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
