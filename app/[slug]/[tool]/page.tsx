import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seoService } from '@/services/seo/seo-service';
import { languageService } from '@/services/languages/language-service';
import { PseoClientView } from '../PseoClientView';

interface PageProps {
  params: Promise<{ slug: string; tool: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: lang, tool } = await params;
  const page = seoService.getPageBySlug(tool, lang);

  if (!page || !page.isPublished) {
    return {
      title: 'Page Not Found | Goinstaller.com',
    };
  }

  const url = `https://www.goinstaller.com/${lang}/${page.slug}`;

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.keywords,
    robots: page.isIndexable ? 'index, follow' : 'noindex, nofollow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url,
      siteName: 'Goinstaller.com',
      type: 'website',
    },
  };
}

export default async function LocalizedToolPage({ params }: PageProps) {
  const { slug: lang, tool } = await params;
  const language = languageService.getLanguageByCode(lang);
  const page = seoService.getPageBySlug(tool, lang);

  if (!language || !language.isEnabled || !page || !page.isPublished) {
    notFound();
  }

  const jsonLd = seoService.generateJsonLd(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PseoClientView page={page} lang={lang} isRtl={language.isRtl} />
    </>
  );
}
