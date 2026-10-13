import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/require-auth';
import { db } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return auth.response!;

  const stats = db.getTelemetryStats();
  const platforms = db.getAllPlatforms();
  const pages = db.getAllToolPages();
  const languages = db.getAllLanguages();

  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      totalPages: pages.length,
      publishedPages: pages.filter((p) => p.isPublished).length,
      totalLanguages: languages.length,
      totalPlatforms: platforms.length,
      activePlatforms: platforms.filter((p) => p.isEnabled).length,
    },
    extractors: platforms.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      domains: p.urlPatterns,
      enabled: p.isEnabled,
      description: p.description,
      badge: p.badge,
    })),
  });
}
