import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DMCA & Copyright Compliance Policy | Goinstaller.com',
  description: 'Digital Millennium Copyright Act (DMCA) notice and takedown guidelines for Goinstaller.com.',
};

export default function DmcaPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            DMCA &amp; Copyright Policy
          </h1>
          <p className="text-xs text-slate-400 mb-8">Official Notice and Takedown Procedure</p>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Respect for Intellectual Property</h2>
              <p>
                Goinstaller.com respects the intellectual property rights of creators, content owners, and platforms. We strictly
                comply with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright directives.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Notice to Copyright Holders</h2>
              <p>
                Goinstaller does not maintain an archive of video or audio files. When a URL is submitted, our utility only parses
                the publicly available media stream for personal offline caching. However, if you are a copyright owner or an authorized
                agent and wish to request domain-level blacklisting of specific URLs or content identifiers, we will promptly honor your request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Filing a Takedown Notice</h2>
              <p className="mb-2">To file a valid copyright infringement notice, please provide the following details:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The exact URL(s) on the third-party platform that you want excluded from parsing.</li>
                <li>Contact information including your legal name, organization, physical address, telephone number, and email.</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized.</li>
                <li>A statement under penalty of perjury that the information in your notice is accurate.</li>
                <li>An electronic or physical signature of the copyright owner or authorized representative.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Designated Copyright Agent</h2>
              <p>
                Please email all DMCA notices to:{' '}
                <span className="font-semibold text-emerald-700 font-mono">dmca@goinstaller.com</span>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
