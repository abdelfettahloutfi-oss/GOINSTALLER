'use client';

import React, { useState } from 'react';
import { DatabaseToolPage } from '@/lib/db/types';
import { Navbar } from '@/components/Navbar';
import { DownloaderHero } from '@/components/DownloaderHero';
import { MediaResultCard } from '@/components/MediaResultCard';
import { HowItWorks } from '@/components/HowItWorks';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { MediaMetadata } from '@/lib/extractors/types';
import { Check, Sparkles, Video, Music } from 'lucide-react';
import Link from 'next/link';

interface PseoClientViewProps {
  page: DatabaseToolPage;
  lang?: string;
  isRtl?: boolean;
}

export function PseoClientView({ page, lang = 'en', isRtl = false }: PseoClientViewProps) {
  const [resolvedMedia, setResolvedMedia] = useState<MediaMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar currentPlatform={page.platform} currentLang={lang} />

      <main className="flex-1">
        {/* Downloader Hero configured specifically for this platform & intent */}
        <DownloaderHero
          initialPlatform={page.platform}
          defaultTitle={page.h1}
          defaultTagline={page.tagline}
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

        {/* Resolved Media Card */}
        {resolvedMedia && (
          <div id="media-result-container">
            <MediaResultCard
              key={`${resolvedMedia.platform}-${resolvedMedia.mediaId}`}
              metadata={resolvedMedia}
              onReset={() => setResolvedMedia(null)}
            />
          </div>
        )}

        {/* Platform Feature Highlight Box - Centered Header & Balanced Grid */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {page.badge || 'PRO FEATURES INCLUDED'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Features of {page.platformName} Downloader
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
                {(page.features || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-100 mb-1">{feat.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Guide */}
        <HowItWorks platformName={page.platformName} />

        {/* Informational Rich Content Section - Centered */}
        <section className="py-14 bg-white border-b border-slate-200 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
              Goinstaller.com - The Best {page.platformName} Media Tool
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4 text-center mx-auto">
              <p>
                Goinstaller is an online video and audio extraction service dedicated to providing fast,
                high-speed downloads for <strong>{page.platformName}</strong>. With our cloud stream processing,
                you can download any public video or extract audio tracks in original fidelity without installing
                any third-party software, extensions, or applications.
              </p>
              <p>
                Whether you need {page.targetKeyword} for offline playback, study sessions, content archiving,
                or creative inspiration, Goinstaller gives you direct access to 1080p Full HD, 4K UHD, and 320kbps MP3
                streams across all mobile devices and desktop computers.
              </p>
            </div>

            {/* Quick Links Matrix - Centered */}
            <div className="mt-8 pt-8 border-t border-slate-200 text-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 text-center">
                Popular {page.platformName} Tools & Converters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link
                  href="/youtube-video-downloader"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs text-slate-700 font-medium"
                >
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>YouTube 1080p Downloader</span>
                </Link>
                <Link
                  href="/youtube-to-mp3"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs text-slate-700 font-medium"
                >
                  <Music className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>YouTube to 320k MP3</span>
                </Link>
                <Link
                  href="/tiktok-video-downloader"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs text-slate-700 font-medium"
                >
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>TikTok No Watermark</span>
                </Link>
                <Link
                  href="/instagram-reels-downloader"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs text-slate-700 font-medium"
                >
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instagram Reels HD</span>
                </Link>
                <Link
                  href="/facebook-video-downloader"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs text-slate-700 font-medium"
                >
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Facebook Reels MP4</span>
                </Link>
                <Link
                  href="/twitter-video-downloader"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs text-slate-700 font-medium"
                >
                  <Music className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Twitter Media Saver</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <FaqSection platformName={page.platformName} customFaqs={page.faqs} />
      </main>

      <Footer />
    </div>
  );
}
