import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Minimal check: run a tiny raw query. Prisma may manage connection pooling.
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    console.error('health check failed', err);
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 });
  } finally {
    // Do not disconnect Prisma here to avoid opening/closing on every request in serverless envs.
  }
}
