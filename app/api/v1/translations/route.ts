import { NextRequest, NextResponse } from 'next/server';
import { languageService } from '@/services/languages/language-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'en';
  const ns = searchParams.get('ns') || undefined;

  const translations = languageService.getTranslations(lang, ns);
  return NextResponse.json({
    success: true,
    language: lang,
    translations,
  });
}
