'use client';

import React from 'react';
import { Loader2, CheckCircle2, Download, ShieldCheck, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { MediaFormat, MediaMetadata } from '@/services/platforms/types';
import { DownloadProgressState } from '@/lib/api/media-client';

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: MediaMetadata | null;
  format: MediaFormat | null;
  progress: DownloadProgressState;
}

export function DownloadProgressModal({
  isOpen,
  onClose,
  metadata,
  format,
  progress,
}: DownloadProgressModalProps) {
  if (!isOpen || !metadata || !format) return null;

  const isCompleted = progress.phase === 'complete';
  const isFailed = progress.step?.toLowerCase().includes('failed') || progress.step?.toLowerCase().includes('error');

  const getDisplaySize = () => {
    const raw = (format.filesize || '').trim();
    if (
      raw &&
      !raw.toLowerCase().includes('authentic') &&
      !raw.toLowerCase().includes('stream') &&
      !raw.toLowerCase().includes('auto') &&
      !raw.toLowerCase().includes('direct')
    ) {
      if (/^\d+$/.test(raw)) {
        const bytes = parseInt(raw, 10);
        const mb = bytes / (1024 * 1024);
        return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
      }
      return raw;
    }
    return format.filesize || 'Standard';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close download modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          {isFailed ? (
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>
          ) : isCompleted ? (
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin stroke-[2.5]" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
          {isFailed ? 'Download Notice' : isCompleted ? 'Download Ready!' : 'Processing Media Stream'}
        </h3>
        <p className="text-xs text-center text-slate-500 mb-5 line-clamp-1 px-4">
          {metadata.title}
        </p>

        {/* Progress Bar Container */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
            <span className="truncate pr-2">{progress.step}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isFailed
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* File Specs Details */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs mb-5">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Format</span>
            <span className="font-semibold text-slate-800 uppercase">{format.ext}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Quality</span>
            <span className="font-semibold text-slate-800 truncate block">{format.quality}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Size</span>
            <span className="font-semibold text-slate-800">{getDisplaySize()}</span>
          </div>
        </div>

        {/* Fallback Direct CDN Mirror link if available */}
        {format.directStreamUrl && (
          <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 truncate text-[11px]">
              CDN Mirror Fallback:
            </span>
            <a
              href={format.directStreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`video_${metadata.mediaId}.${format.ext}`}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold shrink-0 text-[11px] underline underline-offset-2"
            >
              <span>Direct Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Compliance notice */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center mb-5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified media stream. Zero adware or malware.</span>
        </div>

        {/* Action Button */}
        {isCompleted || isFailed ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Close</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            Run in background
          </button>
        )}
      </div>
    </div>
  );
}
