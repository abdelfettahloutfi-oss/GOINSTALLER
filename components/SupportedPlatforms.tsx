'use client';

import React from 'react';
import Link from 'next/link';
import {
  Youtube,
  Facebook,
  Instagram,
  Video,
  Music2,
  Twitter,
  ArrowRight,
  Check,
} from 'lucide-react';

export function SupportedPlatforms() {
  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube Downloader',
      badge: '4K & 1080p',
      formats: 'MP4 (4K, 1080p), WebM, MP3 (320kbps)',
      features: ['YouTube Shorts', 'High-bitrate MP3', 'Channel videos'],
      href: '/youtube-video-downloader',
      icon: Youtube,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'facebook',
      name: 'Facebook Downloader',
      badge: 'FDownloader Support',
      formats: 'MP4 Full HD, 720p, MP3 Audio',
      features: ['Facebook Reels', 'Watch clips', 'Public group videos'],
      href: '/facebook-video-downloader',
      icon: Facebook,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'instagram',
      name: 'Instagram Downloader',
      badge: 'Reels & Stories',
      formats: 'MP4 HD, Reels MP3 Audio',
      features: ['Trending IG Reels', 'Video posts', 'Carousel extraction'],
      href: '/instagram-video-downloader',
      icon: Instagram,
      color: 'text-pink-600 bg-pink-50 border-pink-200',
    },
    {
      id: 'tiktok',
      name: 'TikTok Downloader',
      badge: 'No Watermark',
      formats: 'MP4 No-Watermark, MP3 Sound',
      features: ['Watermark removal', 'Original sound audio', 'HD vertical format'],
      href: '/tiktok-video-downloader',
      icon: Music2,
      color: 'text-slate-900 bg-slate-100 border-slate-300',
    },
    {
      id: 'twitter',
      name: 'X (Twitter) Downloader',
      badge: 'Videos & GIFs',
      formats: 'MP4 (1080p, 720p), MP3 Audio',
      features: ['Converts animated GIFs', 'Multi-bitrate MP4', 'Broadcast clips'],
      href: '/twitter-video-downloader',
      icon: Twitter,
      color: 'text-slate-800 bg-slate-100 border-slate-300',
    },
    {
      id: 'vimeo',
      name: 'Vimeo Downloader',
      badge: 'Cinema Master',
      formats: 'MP4 4K UHD, 1080p Cinema',
      features: ['Ultra-high bitrate', 'Soundtrack extraction', 'Motion films'],
      href: '/vimeo-video-downloader',
      icon: Video,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header centered */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Supported Platforms & Formats
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Goinstaller is architected with a decoupled extractor registry supporting all primary video ecosystems.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 p-5 sm:p-6 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border ${p.color}`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mb-3.5">{p.formats}</p>

                  <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={p.href}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span>Open {p.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
