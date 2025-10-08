import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Minimal check: run a tiny raw query. Prisma may manage connection pooling.
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }, { status: 200 });
  } catch (err) {
    console.error('health check failed', err);
    return NextResponse.json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      message: String(err) 
    }, { status: 500 });
  } finally {
    // Do not disconnect Prisma here to avoid opening/closing on every request in serverless envs.
  }
}
