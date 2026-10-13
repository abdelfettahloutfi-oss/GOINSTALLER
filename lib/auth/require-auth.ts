import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth/auth-service';
import { AdminUser } from '@/services/auth/types';

export async function verifyAdminRequest(req: NextRequest): Promise<{ authorized: boolean; user?: AdminUser; response?: NextResponse }> {
  // Check cookies or Authorization header
  const token =
    req.cookies.get('gis_admin_token')?.value ||
    req.cookies.get('gis_admin_session')?.value ||
    req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      ),
    };
  }

  const user = await authService.verifySession(token);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Session expired or invalid.' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true, user };
}
