import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const platforms = db.getAllPlatforms().filter((p) => p.isEnabled);
  return NextResponse.json({
    success: true,
    platforms,
  });
}
