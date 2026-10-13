'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DownloaderHero } from '@/components/DownloaderHero';
import { MediaResultCard } from '@/components/MediaResultCard';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { HowItWorks } from '@/components/HowItWorks';
import { SupportedPlatforms } from '@/components/SupportedPlatforms';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { MediaMetadata } from '@/lib/extractors/types';

interface HomePageClientProps {
  lang?: string;
  isRtl?: boolean;
  translations?: Record<string, string>;
}

export function HomePageClient({ lang = 'en', isRtl = false, translations = {} }: HomePageClientProps) {
  const [resolvedMedia, setResolvedMedia] = useState<MediaMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const title = translations.tagline || (
    isRtl
      ? 'أسرع موقع لتحميل الفيديو والصوت بجودة عالية مجاناً'
      : lang === 'fr'
      ? 'Téléchargeur Vidéo & Audio Universel Gratuit'
      : 'Free Online Video & Audio Downloader'
  );

  const tagline = isRtl
    ? 'قم بتحميل مقاطع الفيديو بدقة عالية 1080p و 4K واستخرج الصوت بصيغة MP3 من يوتيوب، فيسبوك، انستغرام، تيك توك، وتويتر.'
    : lang === 'fr'
    ? 'Téléchargez des vidéos HD 1080p, 4K et extrayez des fichiers MP3 depuis YouTube, Facebook, Instagram, TikTok, Twitter et Vimeo.'
    : 'Download high quality videos in Full HD 1080p, 2K, 4K, and extract studio MP3 audio from YouTube, Facebook, Instagram, TikTok, Twitter/X, and Vimeo.';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar currentLang={lang} />

      <main className="flex-1">
        {/* Main Downloader Hero */}
        <DownloaderHero
          defaultTitle={title}
          defaultTagline={tagline}
          onMediaResolved={(media) => {
            setResolvedMedia(media);
            if (media) {
              setTimeout(() => {
                const el = document.getElementById('media-result-container');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* Resolved Media Result Card */}
        {resolvedMedia && (
          <div id="media-result-container">
            <MediaResultCard
              key={`${resolvedMedia.platform}-${resolvedMedia.mediaId}`}
              metadata={resolvedMedia}
              onReset={() => setResolvedMedia(null)}
            />
          </div>
        )}

        {/* Value Proposition & Benefits */}
        <WhyChooseUs />

        {/* 3-Step Guide */}
        <HowItWorks platformName={isRtl ? 'أي مقطع فيديو أو صوت' : 'any video or audio'} />

        {/* Supported Platforms Grid */}
        <SupportedPlatforms />

        {/* FAQ Accordion */}
        <FaqSection platformName={isRtl ? 'الفيديو والموسيقى' : 'videos and music'} />
      </main>

      <Footer />
    </div>
  );
}
