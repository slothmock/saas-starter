import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';

export async function GET() {
  try {
    // Run a simple query to confirm DB is responding
    await db.execute('SELECT 1');

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: any) {
    console.error('Health check DB error:', err);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}