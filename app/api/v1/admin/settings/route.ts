import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth/auth-service';
import { settingsService } from '@/services/settings/settings-service';

export async function GET(req: NextRequest) {
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

  const backendSettings = settingsService.getBackendSettings();

  return NextResponse.json({
    success: true,
    settings: backendSettings,
  });
}

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
    const body = await req.json();
    if (body.features) {
      settingsService.updateFeatures(body.features);
    }
    if (body.limits) {
      settingsService.updateLimits(body.limits);
    }

    return NextResponse.json({
      success: true,
      settings: settingsService.getBackendSettings(),
      message: 'System settings updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
