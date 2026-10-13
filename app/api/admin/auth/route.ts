import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth/auth-service';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const result = await authService.authenticate(password, username || 'admin');

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    const response = NextResponse.json(result);
    // Set secure HTTP-only cookie
    response.cookies.set('gis_admin_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get('gis_admin_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await authService.verifySession(token);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}

export async function DELETE(req: NextRequest) {
  const token =
    req.cookies.get('gis_admin_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    await authService.revokeSession(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('gis_admin_token');
  return response;
}
