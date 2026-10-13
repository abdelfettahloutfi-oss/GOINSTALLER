import { NextRequest, NextResponse } from 'next/server';
import { extractorRegistry } from '@/services/platforms/registry';
import { authService } from '@/services/auth/auth-service';

export async function POST(req: NextRequest) {
  const token =
    req.cookies.get('gis_admin_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');

  const user = token ? await authService.verifySession(token) : null;
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    const { action, extractorId, enabled } = await req.json();

    if (action === 'toggle_extractor' && extractorId) {
      const ok = extractorRegistry.setExtractorStatus(extractorId, Boolean(enabled));
      return NextResponse.json({
        success: ok,
        message: `Platform ${extractorId} is now ${enabled ? 'enabled' : 'in maintenance mode'}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
