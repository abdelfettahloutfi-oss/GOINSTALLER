import { NextRequest, NextResponse } from 'next/server';
import { seoService } from '@/services/seo/seo-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const lang = searchParams.get('lang') || undefined;

  if (slug) {
    const page = seoService.getPageBySlug(slug, lang);
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    const jsonLd = seoService.generateJsonLd(page);
    return NextResponse.json({
      success: true,
      page,
      jsonLd,
    });
  }

  const overview = seoService.getOverview();
  return NextResponse.json({
    success: true,
    overview,
  });
}
