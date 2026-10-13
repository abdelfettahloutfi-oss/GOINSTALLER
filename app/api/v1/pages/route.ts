import { NextRequest, NextResponse } from 'next/server';
import { seoService } from '@/services/seo/seo-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'en';
  const platform = searchParams.get('platform') || undefined;

  const pages = seoService.getAllPages({
    isPublished: true,
    languageCode: lang,
    platform,
  });

  return NextResponse.json({
    success: true,
    count: pages.length,
    pages,
  });
}
