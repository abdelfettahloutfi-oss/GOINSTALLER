'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Clipboard,
  X,
  Loader2,
  Sparkles,
  Youtube,
  Facebook,
  Instagram,
  Video,
  Music2,
  Twitter,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE } from '@/lib/extractors/types';
import { resolveMediaUrl } from '@/lib/api/media-client';
import { extractorRegistry } from '@/lib/extractors/registry';
import { validateMediaResult, VALIDATOR_RUNTIME_VERSION } from '@/lib/extractors/validator';

interface DownloaderHeroProps {
  initialPlatform?: string;
  defaultTitle?: string;
  defaultTagline?: string;
  onMediaResolved: (data: MediaMetadata | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function DownloaderHero({
  initialPlatform,
  defaultTitle = 'Free Online Video & Audio Downloader',
  defaultTagline = 'Download high quality videos in Full HD 1080p, 2K, 4K, and extract MP3 audio files from YouTube, Facebook, Instagram, TikTok, Twitter/X, and more.',
  onMediaResolved,
  isLoading,
  setIsLoading,
}: DownloaderHeroProps) {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Derive detected extractor directly from URL without redundant effect
  const detectedExtractor: PlatformExtractor | null = url.trim()
    ? extractorRegistry.findExtractorForUrl(url.trim())
    : null;

  // Handle Paste from Clipboard
  const handlePaste = async () => {
    try {
      setErrorMessage(null);
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 2000);
          return;
        }
      }
      // If clipboard permission is restricted or empty, focus the input for user
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();
    console.log('[BROWSER BUNDLE RUNTIME VERSION]', VALIDATOR_RUNTIME_VERSION);
    console.log('[DOWNLOAD DEBUG] submitted URL:', cleanUrl);
    if (!cleanUrl) {
      setErrorMessage('Please paste or enter a valid video link.');
      return;
    }

    // IMMEDIATELY clear previous result state, error, and start clean fetch
    setErrorMessage(null);
    onMediaResolved(null);
    setIsLoading(true);

    try {
      const result = await resolveMediaUrl(cleanUrl);
      console.log('[DOWNLOAD DEBUG] API result:', result);
      console.log('[DOWNLOAD DEBUG] result.success:', result.success);
      console.log('[DOWNLOAD DEBUG] result.data:', result.data);

      if (result.success && result.data) {
        // Strict client-side verification that returned media strictly belongs to the submitted URL
        const validation = validateMediaResult(cleanUrl, result.data);
        console.log('[DOWNLOAD DEBUG] validation result:', validation);
        if (validation.valid) {
          console.log('[DOWNLOAD DEBUG] validation PASSED -> triggering onMediaResolved');
          onMediaResolved(result.data);
        } else {
          console.warn('[DOWNLOAD DEBUG] validation FAILED:', validation.reason);
          setErrorMessage(validation.reason || EXACT_MEDIA_ERROR_MESSAGE);
          onMediaResolved(null);
        }
      } else {
        console.warn('[DOWNLOAD DEBUG] API returned unsuccessful result:', result.error);
        setErrorMessage(result.error || EXACT_MEDIA_ERROR_MESSAGE);
        onMediaResolved(null);
      }
    } catch (err: any) {
      console.error('[DOWNLOAD DEBUG] handleSubmit caught exception:', err);
      setErrorMessage(err?.message || EXACT_MEDIA_ERROR_MESSAGE);
      onMediaResolved(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleLinks = extractorRegistry.getSampleLinks();

  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-slate-100/80 via-white to-slate-50 border-b border-slate-200">
      {/* Decorative background grid subtle effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          {defaultTitle}
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          {defaultTagline}
        </p>

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-1.5 sm:p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all duration-200">
            {/* Input & embedded controls */}
            <div className="relative flex-1 flex items-center min-w-0">
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video or audio link here (YouTube, FB, TikTok, IG...)"
                className="w-full py-3.5 pl-4 pr-24 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-hidden focus:ring-0"
                disabled={isLoading}
                autoComplete="off"
                aria-label="Video or audio URL input"
              />

              {/* Inside Input Action Buttons: Paste & Clear */}
              <div className="absolute right-2 flex items-center gap-1">
                {url && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('');
                      setErrorMessage(null);
                      onMediaResolved(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                  title="Paste from clipboard"
                >
                  {copiedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Pasted</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5 text-slate-600" />
                      <span>Paste</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm sm:text-base shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer select-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {/* Platform detection indicator */}
          {detectedExtractor && (
            <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-slate-600 animate-in fade-in">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Detected platform: <strong>{detectedExtractor.name}</strong>
              </span>
              <span className="text-slate-400">• Ready to extract MP4 & MP3 formats</span>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to process link</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}
        </form>

        {/* Quick sample links for testing */}
        <div className="mt-7 pt-5 border-t border-slate-200/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Try a sample link:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sampleLinks.map((sample) => (
              <button
                key={sample.platform}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  setErrorMessage(null);
                  onMediaResolved(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
