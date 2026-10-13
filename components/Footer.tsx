'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      {/* Top Section - Centered Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        {/* Brand & Identity Centered */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-10 max-w-xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Goinstaller<span className="text-emerald-600">.com</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed">
            Goinstaller is a high-speed multi-platform media downloader tool. Save video and audio
            streams from YouTube, Facebook, Instagram, TikTok, Twitter/X, and Vimeo in 1080p, 4K, and
            MP3 320kbps.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Domain: www.goinstaller.com</span>
          </div>
        </div>

        {/* 3 Balanced Centered Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto mb-10">
          {/* Col 1: Supported Platforms */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3.5">
              Platform Tools
            </h4>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/youtube-video-downloader" className="hover:text-emerald-600 transition-colors">
                  YouTube Downloader
                </Link>
              </li>
              <li>
                <Link href="/facebook-video-downloader" className="hover:text-emerald-600 transition-colors">
                  Facebook Downloader
                </Link>
              </li>
              <li>
                <Link href="/instagram-video-downloader" className="hover:text-emerald-600 transition-colors">
                  Instagram Downloader
                </Link>
              </li>
              <li>
                <Link href="/tiktok-video-downloader" className="hover:text-emerald-600 transition-colors">
                  TikTok Downloader
                </Link>
              </li>
              <li>
                <Link href="/twitter-video-downloader" className="hover:text-emerald-600 transition-colors">
                  Twitter / X Downloader
                </Link>
              </li>
              <li>
                <Link href="/vimeo-video-downloader" className="hover:text-emerald-600 transition-colors">
                  Vimeo Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Popular Formats & Converters */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3.5">
              Formats & Audio
            </h4>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/youtube-to-mp3" className="hover:text-emerald-600 transition-colors">
                  YouTube to MP3 (320kbps)
                </Link>
              </li>
              <li>
                <Link href="/tiktok-without-watermark" className="hover:text-emerald-600 transition-colors">
                  TikTok No Watermark
                </Link>
              </li>
              <li>
                <Link href="/facebook-reels-downloader" className="hover:text-emerald-600 transition-colors">
                  Facebook Reels MP4
                </Link>
              </li>
              <li>
                <Link href="/instagram-reels-downloader" className="hover:text-emerald-600 transition-colors">
                  Instagram Reels HD
                </Link>
              </li>
              <li>
                <Link href="/threads-video-downloader" className="hover:text-emerald-600 transition-colors">
                  Threads Media Saver
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Policy (HTML & XML Sitemap links removed) */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3.5">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/terms" className="hover:text-emerald-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-emerald-600 transition-colors">
                  DMCA & Copyright
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical / Copyright Disclaimer Box - Centered */}
        <div className="pt-6 border-t border-slate-100 bg-slate-50/80 p-5 rounded-2xl text-[11px] text-slate-500 leading-relaxed max-w-4xl mx-auto text-center">
          <strong className="text-slate-700">Ethical & Legal Compliance Notice: </strong>
          Goinstaller.com does not host, clone, or store any video or audio files on its servers. All
          media streams are parsed and downloaded directly from third-party platform CDNs. Users are
          responsible for ensuring they have the legal right or authorization to download any content.
          Goinstaller does not circumvent digital rights management (DRM) or private access controls.
        </div>
      </div>

      {/* Bottom Copyright Bar - Centered */}
      <div className="border-t border-slate-100 py-5 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500 text-[11px] text-center">
          <div>
            © {currentYear} <strong>Goinstaller.com</strong>. All rights reserved.
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/about" className="hover:text-slate-800 transition-colors">
              About
            </Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">
              Privacy
            </Link>
            <Link href="/dmca" className="hover:text-slate-800 transition-colors">
              DMCA
            </Link>
            <Link href="/contact" className="hover:text-slate-800 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
