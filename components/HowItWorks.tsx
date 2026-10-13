'use client';

import React from 'react';
import { Copy, SlidersHorizontal, DownloadCloud } from 'lucide-react';

interface HowItWorksProps {
  platformName?: string;
}

export function HowItWorks({ platformName = 'online video & audio' }: HowItWorksProps) {
  const steps = [
    {
      number: '1',
      title: 'Copy & Paste Media Link',
      desc: `Find the ${platformName} video, Reel, or audio clip you want to download. Copy its URL and paste it into the search bar at the top of Goinstaller.`,
      icon: Copy,
    },
    {
      number: '2',
      title: 'Select Format & Quality',
      desc: 'Our engine automatically inspects the available streams. Select your preferred resolution (1080p Full HD, 720p, 480p) or convert directly to MP3 320kbps.',
      icon: SlidersHorizontal,
    },
    {
      number: '3',
      title: 'Instant Direct Download',
      desc: 'Click "Download" to generate the media stream. The file will save directly to your mobile phone gallery, tablet, or computer downloads directory.',
      icon: DownloadCloud,
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How to Download {platformName}?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Get your media in 3 effortless steps without installing extensions or third-party software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col items-center text-center group hover:shadow-md transition-shadow"
            >
              {/* Number Circle Badge matching reference image style */}
              <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-200">
                {step.number}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2.5">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
