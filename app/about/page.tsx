import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Download, ShieldCheck, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Goinstaller.com | Free Online Media Downloader',
  description: 'About Goinstaller.com – Our mission, technology stack, and architectural standards for media stream extraction.',
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                About Goinstaller.com
              </h1>
              <span className="text-xs text-slate-500">Domain: www.goinstaller.com</span>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>Goinstaller.com</strong> was founded with a single objective: to provide a clean, modern,
              and ethical media stream downloader for users worldwide. Unlike legacy download websites plagued by
              deceptive advertisements, malware installers, and slow redirects, Goinstaller is built using modern
              cloud web architecture prioritizing speed, security, and mobile ergonomics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Zap className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <h2 className="font-bold text-slate-900 text-sm mb-1">Ultra Fast</h2>
                <p className="text-xs text-slate-500">Distributed stream extraction in under 2 seconds.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <ShieldCheck className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <h2 className="font-bold text-slate-900 text-sm mb-1">Zero Malware</h2>
                <p className="text-xs text-slate-500">Pure direct browser streams with no ad injects.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Globe className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h2 className="font-bold text-slate-900 text-sm mb-1">Multi-Platform</h2>
                <p className="text-xs text-slate-500">YouTube, Facebook, Instagram, TikTok, X, Vimeo.</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900">Extensible Architecture</h2>
            <p>
              Our codebase is decoupled into independent platform extractors and a modular service layer. This enables
              adding new video and audio platforms seamlessly without affecting ongoing user sessions.
            </p>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                Try the Downloader
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
