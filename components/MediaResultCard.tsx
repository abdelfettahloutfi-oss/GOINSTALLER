'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Download,
  Video,
  Music,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  Clock,
  Eye,
  Heart,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MediaFormat, MediaMetadata, EXACT_MEDIA_ERROR_MESSAGE } from '@/lib/extractors/types';
import { executeDownloadFlow, DownloadProgressState } from '@/lib/api/media-client';
import { DownloadProgressModal } from './DownloadProgressModal';
import { validateMediaResult } from '@/lib/extractors/validator';

interface MediaResultCardProps {
  metadata: MediaMetadata;
  onReset: () => void;
}

export function MediaResultCard({ metadata, onReset }: MediaResultCardProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'thumbnail'>('video');
  const [downloadingFormat, setDownloadingFormat] = useState<MediaFormat | null>(null);
  const [progressState, setProgressState] = useState<DownloadProgressState>({
    percent: 0,
    step: '',
    phase: 'init',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevMediaKey, setPrevMediaKey] = useState(`${metadata.platform}-${metadata.mediaId}`);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Synchronize internal error state during render if metadata prop changes
  const currentKey = `${metadata.platform}-${metadata.mediaId}`;
  if (prevMediaKey !== currentKey) {
    setPrevMediaKey(currentKey);
    setImgError(false);
    setAvatarError(false);
    setActiveTab('video');
  }

  const imgSrc = metadata.thumbnail;

  // Strict verification gate: download buttons MUST ONLY be shown if the media matches the requested URL
  const validation = validateMediaResult(metadata.sourceUrl || metadata.canonicalUrl, metadata);

  if (!validation.valid) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Extraction Verification Notice</h3>
          <p className="text-sm text-red-700 max-w-md mx-auto mb-6">
            {EXACT_MEDIA_ERROR_MESSAGE}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try another URL
          </button>
        </div>
      </div>
    );
  }

  // Filter formats by tab
  const videoFormats = metadata.formats.filter((f) => f.type === 'video');
  const audioFormats = metadata.formats.filter((f) => f.type === 'audio');
  const thumbFormats = metadata.formats.filter((f) => f.type === 'thumbnail');

  const currentFormats =
    activeTab === 'video'
      ? videoFormats
      : activeTab === 'audio'
      ? audioFormats
      : thumbFormats;

  const getDisplayFileSize = (fmt: MediaFormat): string => {
    const rawSize = (fmt.filesize || '').trim();
    if (
      rawSize &&
      !rawSize.toLowerCase().includes('authentic') &&
      !rawSize.toLowerCase().includes('stream') &&
      !rawSize.toLowerCase().includes('auto') &&
      !rawSize.toLowerCase().includes('direct')
    ) {
      if (/^\d+$/.test(rawSize)) {
        const bytes = parseInt(rawSize, 10);
        const mb = bytes / (1024 * 1024);
        return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
      }
      return rawSize;
    }

    const duration =
      metadata.durationSeconds ||
      (metadata.duration && metadata.duration.includes(':')
        ? metadata.duration.split(':').reduce((acc, t) => acc * 60 + (parseInt(t, 10) || 0), 0)
        : 90);

    let bitrateBps = 3200 * 1000;
    if (fmt.bitrate) {
      const match = fmt.bitrate.match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        bitrateBps = fmt.bitrate.toLowerCase().includes('mbps') ? val * 1000000 : val * 1000;
      }
    } else if (fmt.type === 'audio') {
      bitrateBps = fmt.quality?.includes('128') ? 128 * 1000 : 320 * 1000;
    } else if (fmt.quality?.includes('4K') || fmt.quality?.includes('2160')) {
      bitrateBps = 16000 * 1000;
    } else if (fmt.quality?.includes('1080')) {
      bitrateBps = 4200 * 1000;
    } else if (fmt.quality?.includes('720')) {
      bitrateBps = 2200 * 1000;
    } else if (fmt.quality?.includes('480')) {
      bitrateBps = 1100 * 1000;
    }

    const estimatedBytes = (bitrateBps * (duration || 90)) / 8;
    const mb = estimatedBytes / (1024 * 1024);
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async (format: MediaFormat) => {
    setDownloadingFormat(format);
    setIsModalOpen(true);

    try {
      await executeDownloadFlow(format, metadata, (state) => {
        setProgressState(state);
      });
    } catch {
      setProgressState({
        percent: 100,
        step: 'Download failed. Please try an alternative resolution.',
        phase: 'complete',
      });
    }
  };

  return (
    <div
      key={`${metadata.platform}-${metadata.mediaId}`}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Media Ready for Download
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Platform: <strong className="text-slate-700">{metadata.platformName}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Download another</span>
          </button>
        </div>

        {/* Media Overview Body */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail Preview */}
            <div className="relative w-full md:w-72 aspect-video shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group flex items-center justify-center">
              {imgSrc && !imgError ? (
                <Image
                  key={`${metadata.platform}-${metadata.mediaId}-${imgSrc}`}
                  src={imgSrc}
                  alt={metadata.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Video className="w-10 h-10 mb-2 opacity-60" />
                  <span className="text-xs font-medium">{metadata.platformName} Media</span>
                </div>
              )}
              {/* Duration badge */}
              {metadata.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{metadata.duration}</span>
                </div>
              )}
            </div>

            {/* Metadata info: Title, Author, Views/Likes, Format Switcher */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-2.5">
                {metadata.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-1.5">
                  {metadata.authorAvatar && !avatarError && (
                    <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        key={`${metadata.mediaId}-avatar`}
                        src={metadata.authorAvatar}
                        alt={metadata.author}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                  )}
                  <span className="font-semibold text-slate-800">{metadata.author}</span>
                </div>

                {metadata.views && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{metadata.views}</span>
                  </div>
                )}

                {metadata.likes && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{metadata.likes}</span>
                  </div>
                )}

                {metadata.sourceUrl && (
                  <a
                    href={metadata.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    <span>Original post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Format selection Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-sm mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'video'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Video (MP4)</span>
                  <span className="text-[10px] px-1 rounded-full bg-slate-200/70 text-slate-600 ml-0.5">
                    {videoFormats.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'audio'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-teal-600" />
                  <span>Audio (MP3)</span>
                  <span className="text-[10px] px-1 rounded-full bg-slate-200/70 text-slate-600 ml-0.5">
                    {audioFormats.length}
                  </span>
                </button>

                {thumbFormats.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('thumbnail')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'thumbnail'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Cover</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Formats Table / List */}
          <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-5 sm:col-span-4">Quality / Resolution</div>
              <div className="col-span-3 sm:col-span-3">Format</div>
              <div className="hidden sm:block sm:col-span-2">File Size</div>
              <div className="col-span-4 sm:col-span-3 text-right">Action</div>
            </div>

            {currentFormats.map((format) => (
              <div
                key={format.id}
                className="px-4 py-3.5 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors"
              >
                {/* Quality & Badges */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm block">
                      {format.quality}
                    </span>
                    {format.resolution && (
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {format.resolution}
                      </span>
                    )}
                  </div>
                  {format.recommended && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Best Quality
                    </span>
                  )}
                </div>

                {/* Format / Codec */}
                <div className="col-span-3 sm:col-span-3">
                  <span className="inline-flex items-center gap-1 font-mono text-xs uppercase px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {format.ext}
                  </span>
                  {format.bitrate && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {format.bitrate}
                    </span>
                  )}
                </div>

                {/* File size */}
                <div className="hidden sm:block sm:col-span-2 text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100/90 text-slate-700 font-mono text-[11px]">
                    {getDisplayFileSize(format)}
                  </span>
                </div>

                {/* Download Button */}
                <div className="col-span-4 sm:col-span-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownload(format)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Legal / Ethical Notice */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center justify-between">
            <span>
              Direct browser download. No pop-up advertisements or software installers required.
            </span>
            <span className="font-semibold text-slate-700 hidden sm:inline">100% Free & Safe</span>
          </div>
        </div>
      </div>

      {/* Download Feedback Modal */}
      <DownloadProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metadata={metadata}
        format={downloadingFormat}
        progress={progressState}
      />
    </div>
  );
}
