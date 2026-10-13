import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth/auth-service';
import { extractionLogger } from '@/services/logging/extractor-logger';

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

  const logs = extractionLogger.getRecentLogs();

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs,
  });
}
