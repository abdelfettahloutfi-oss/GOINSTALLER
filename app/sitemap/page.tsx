import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getAllPseoPages } from '@/lib/seo/pseo-data';
import { Globe, FileText, Download, Shield, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HTML Sitemap & Page Directory | Goinstaller.com',
  description:
    'Comprehensive directory of all media downloader tools, platform converters, legal policies, and XML sitemaps on Goinstaller.com.',
  alternates: {
    canonical: 'https://www.goinstaller.com/sitemap',
  },
};

export default function SitemapDirectoryPage() {
  const pseoPages = getAllPseoPages();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 inline-block mb-3">
            Search Index & Architecture
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Goinstaller Sitemap & Directory
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            A comprehensive overview of all pages, platform downloaders, and XML sitemaps for search engine crawlers and users.
          </p>
        </div>

        {/* XML Sitemaps index banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 mb-10 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-base">Scalable XML Sitemap Architecture</h2>
              </div>
              <p className="text-xs text-slate-400">
                Programmatic sitemap partition index configured for Googlebot and Bingbot.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1 text-white transition-colors"
              >
                <span>sitemap.xml (Index)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/sitemap_1.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 text-slate-200 transition-colors border border-slate-700"
              >
                <span>sitemap_1.xml</span>
              </a>
              <a
                href="/sitemap_2.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 text-slate-200 transition-colors border border-slate-700"
              >
                <span>sitemap_2.xml</span>
              </a>
              <a
                href="/sitemap_3.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 text-slate-200 transition-colors border border-slate-700"
              >
                <span>sitemap_3.xml</span>
              </a>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Programmatic Downloader Pages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Download className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base text-slate-900">Platform Downloader Pages</h2>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {pseoPages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/${page.slug}`}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center justify-between group"
                  >
                    <span>{page.h1}</span>
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-600">
                      /{page.slug}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Core Utility & Legal Pages */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Core Website Pages</h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/" className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center justify-between">
                    <span>Homepage Downloader</span>
                    <span className="font-mono text-slate-400 text-xs">/</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center justify-between">
                    <span>About Goinstaller.com</span>
                    <span className="font-mono text-slate-400 text-xs">/about</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center justify-between">
                    <span>Contact & Support</span>
                    <span className="font-mono text-slate-400 text-xs">/contact</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Shield className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-base text-slate-900">Legal & Privacy Compliance</h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/terms" className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center justify-between">
                    <span>Terms of Service</span>
                    <span className="font-mono text-slate-400 text-xs">/terms</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center justify-between">
                    <span>Privacy Policy</span>
                    <span className="font-mono text-slate-400 text-xs">/privacy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dmca" className="text-slate-700 hover:text-emerald-700 hover:underline flex items-center justify-between">
                    <span>DMCA & Copyright Policy</span>
                    <span className="font-mono text-slate-400 text-xs">/dmca</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
