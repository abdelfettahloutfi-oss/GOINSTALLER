import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { db } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const platforms = db.getAllPlatforms();
  return NextResponse.json({
    success: true,
    platforms,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    if (!body.slug) {
      return NextResponse.json({ success: false, error: 'Platform slug required.' }, { status: 400 });
    }

    const updated = db.updatePlatform(body.slug, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Platform not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, platform: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to update platform' },
      { status: 500 }
    );
  }
}
