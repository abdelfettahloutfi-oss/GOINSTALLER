import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { db } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  try {
    const result = db.syncDefaults();
    return NextResponse.json({
      success: true,
      message: 'Defaults synchronized successfully with PostgreSQL repository.',
      result,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
