import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { db } from '@/lib/db/repository';
import { seoService } from '@/services/seo/seo-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(req.url);
  const languageCode = searchParams.get('lang') || undefined;
  const platform = searchParams.get('platform') || undefined;
  const search = searchParams.get('q') || undefined;

  const pages = db.getAllToolPages({
    languageCode,
    platform,
    search,
  });

  return NextResponse.json({
    success: true,
    total: pages.length,
    pages,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();

    if (body.action === 'generate_pseo') {
      // Programmatic generation action
      const page = seoService.generateProgrammaticPage({
        platform: body.platform,
        platformName: body.platformName || body.platform,
        toolType: body.toolType,
        targetKeyword: body.targetKeyword,
        languageCode: body.languageCode || 'en',
      });
      return NextResponse.json({ success: true, message: 'pSEO page generated successfully', page });
    }

    if (!body.slug || !body.title) {
      return NextResponse.json({ success: false, error: 'Slug and title are required.' }, { status: 400 });
    }

    const saved = db.saveToolPage(body);
    return NextResponse.json({ success: true, page: saved });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save page' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug parameter is required.' }, { status: 400 });
  }

  const deleted = db.deleteToolPage(slug);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Page not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Page /${slug} deleted successfully.` });
}
