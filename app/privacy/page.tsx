import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Goinstaller.com',
  description: 'Privacy policy for Goinstaller.com. Learn about our commitment to zero personal data retention.',
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mb-8">Effective Date: January 1, 2026</p>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. No Personal Account Required</h2>
              <p>
                Goinstaller.com does not require user registration or account creation to use any of our media download features.
                We do not collect names, passwords, or personal profile data from general visitors.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Zero Video &amp; Audio Storage</h2>
              <p>
                We do NOT store, archive, or save any video or audio files on our servers. When a media link is parsed, our service
                acts strictly as a transient stream proxy or direct CDN link resolver between your web browser and the platform host.
                Once a download stream initiates, no media copies remain on Goinstaller infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Server Logs &amp; Anonymized Telemetry</h2>
              <p>
                Like most web applications, our servers may temporarily record anonymized technical logs (such as request timestamps,
                browser user-agent, response codes, and truncated IP hashes) strictly for rate-limiting, bot protection, and server health.
                These logs are purged regularly and are never connected to personal identities.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Cookies &amp; Local Storage</h2>
              <p>
                We only use essential first-party cookies for security and session state (such as administrator dashboard authentication).
                We do not employ third-party tracking cookies across external websites.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Inquiries &amp; Data Rights</h2>
              <p>
                For privacy inquiries or compliance questions, you may contact our data privacy team at{' '}
                <span className="font-semibold text-emerald-700">privacy@goinstaller.com</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
