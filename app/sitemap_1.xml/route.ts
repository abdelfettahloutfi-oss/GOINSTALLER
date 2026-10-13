import { NextResponse } from 'next/server';
import { seoService } from '@/services/seo/seo-service';
import { languageService } from '@/services/languages/language-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const publishedPages = seoService.getPublishedPages();
  const languages = languageService.getActiveLanguages();
  const currentDate = new Date().toISOString().split('T')[0];

  const urls: Array<{ loc: string; priority: string; changefreq: string }> = [];

  // Home pages for all languages
  urls.push({ loc: 'https://www.goinstaller.com', priority: '1.0', changefreq: 'daily' });
  for (const lang of languages) {
    if (lang.code !== 'en') {
      urls.push({ loc: `https://www.goinstaller.com/${lang.code}`, priority: '0.9', changefreq: 'daily' });
    }
  }

  // Programmatic tool pages
  for (const page of publishedPages) {
    if (page.isIndexable) {
      urls.push({
        loc: page.canonicalUrl || `https://www.goinstaller.com/${page.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}
