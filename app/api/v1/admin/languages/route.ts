import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { languageService } from '@/services/languages/language-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const languages = languageService.getAllLanguages();
  return NextResponse.json({
    success: true,
    languages,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    if (!body.code || !body.name) {
      return NextResponse.json({ success: false, error: 'Language code and name are required.' }, { status: 400 });
    }

    const saved = languageService.saveLanguage(body);
    return NextResponse.json({ success: true, language: saved });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save language' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, error: 'Language code required.' }, { status: 400 });
  }

  const success = languageService.deleteLanguage(code);
  if (!success) {
    return NextResponse.json({ success: false, error: 'Cannot delete default English language.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `Language ${code} deleted.` });
}
