import { NextResponse } from 'next/server';
import { languageService } from '@/services/languages/language-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const languages = languageService.getActiveLanguages();
  return NextResponse.json({
    success: true,
    languages,
  });
}
