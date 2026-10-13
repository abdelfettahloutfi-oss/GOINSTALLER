import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Video } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Video className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-emerald-600 uppercase mb-2">404 Error</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-600 text-base mb-8 leading-relaxed">
          The media downloader page or resource you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-200"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
          <Link
            href="/youtube-video-downloader"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>YouTube Downloader</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
