import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { monetizationService } from '@/services/monetization/monetization-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const settings = monetizationService.getSettings();
  return NextResponse.json({
    success: true,
    monetization: settings,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const updated = monetizationService.updateSettings(body);
    return NextResponse.json({
      success: true,
      monetization: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to update monetization settings' },
      { status: 500 }
    );
  }
}
