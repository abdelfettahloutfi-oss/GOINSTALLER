import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seoService } from '@/services/seo/seo-service';
import { languageService } from '@/services/languages/language-service';
import { PseoClientView } from './PseoClientView';
import { HomePageClient } from '../HomePageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Check if slug is a language code (e.g. /fr, /ar, /es)
  const language = languageService.getLanguageByCode(slug);
  if (language && language.isEnabled) {
    const isAr = slug === 'ar';
    const isFr = slug === 'fr';

    const title = isAr
      ? 'Goinstaller – أسرع موقع لتحميل الفيديو والصوت بجودة عالية مجاناً'
      : isFr
      ? 'Goinstaller – Téléchargeur Vidéo & Audio Universel Gratuit'
      : 'Goinstaller – Free Online Video & Audio Downloader';

    const description = isAr
      ? 'قم بتحميل مقاطع الفيديو عالية الدقة والأغاني بصيغة MP3 من يوتيوب، تيك توك، انستغرام، فيسبوك وتويتر مجاناً وبأعلى سرعة.'
      : isFr
      ? 'Téléchargez des vidéos HD et MP3 haute qualité depuis YouTube, TikTok, Facebook, Instagram et X gratuitement.'
      : 'Download HD videos and high-bitrate MP3 audio from YouTube, TikTok, Facebook, Instagram, Vimeo, and X for free.';

    return {
      title,
      description,
      alternates: {
        canonical: `https://www.goinstaller.com/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://www.goinstaller.com/${slug}`,
        siteName: 'Goinstaller.com',
        type: 'website',
      },
    };
  }

  // 2. Check if slug is a Tool Page
  const page = seoService.getPageBySlug(slug);
  if (!page || !page.isPublished) {
    return {
      title: 'Page Not Found | Goinstaller.com',
    };
  }

  const url = page.canonicalUrl || `https://www.goinstaller.com/${page.slug}`;

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
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export default async function DynamicSlugPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Check if slug is a language code
  const language = languageService.getLanguageByCode(slug);
  if (language && language.isEnabled) {
    const translations = languageService.getTranslations(slug, 'common');
    return <HomePageClient lang={slug} isRtl={language.isRtl} translations={translations} />;
  }

  // 2. Check if slug is a Tool Page
  const page = seoService.getPageBySlug(slug);
  if (!page || !page.isPublished) {
    notFound();
  }

  const jsonLd = seoService.generateJsonLd(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PseoClientView page={page} lang="en" isRtl={false} />
    </>
  );
}
