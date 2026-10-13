import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | Goinstaller.com',
  description: 'Terms of service, authorized usage guidelines, and ethical standards for Goinstaller.com.',
};

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 mb-8">Last Updated: January 1, 2026 • Effective Date: January 1, 2026</p>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using <strong>Goinstaller.com</strong> (referred to as &quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;),
                you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree,
                you must immediately discontinue use of the website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Permitted &amp; Ethical Use</h2>
              <p>
                Goinstaller provides a stream extraction tool designed strictly for personal, educational, non-commercial archiving,
                and backup of digital media. You agree to use the Service exclusively for media that you have the legal right to download,
                such as your own user-created content or public domain / creative commons content where downloading is explicitly authorized
                by the content creator and the host platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Prohibition of DRM &amp; Access Control Bypassing</h2>
              <p>
                Goinstaller does NOT circumvent, disable, or bypass any Digital Rights Management (DRM) technologies, access encryption,
                private user authentication, or paywalls. Any URL requiring private account authorization, DRM decryption keys, or subscription
                paywalls will not be processed by our system.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Intellectual Property Rights</h2>
              <p>
                All trademarks, service marks, platform names (including YouTube, Facebook, Instagram, TikTok, X, Vimeo), and logos
                displayed on Goinstaller.com belong to their respective copyright and trademark owners. Goinstaller is an independent tool
                and is neither affiliated with, endorsed by, nor sponsored by any third-party platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Disclaimer of Warranties &amp; Limitation of Liability</h2>
              <p>
                The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
                In no event shall Goinstaller.com, its developers, or its affiliates be liable for any direct, indirect, incidental, or consequential
                damages resulting from the use or inability to use the Service.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
