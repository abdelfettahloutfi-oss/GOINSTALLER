import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { languageService } from '@/services/languages/language-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const translations = languageService.getAllTranslations();
  return NextResponse.json({
    success: true,
    translations,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    if (!body.languageCode || !body.key || body.value === undefined) {
      return NextResponse.json({ success: false, error: 'languageCode, key, and value are required.' }, { status: 400 });
    }

    const saved = languageService.saveTranslation({
      languageCode: body.languageCode,
      namespace: body.namespace || 'common',
      key: body.key,
      value: body.value,
    });

    return NextResponse.json({ success: true, translation: saved });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save translation' },
      { status: 500 }
    );
  }
}
