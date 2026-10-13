'use client';

import React from 'react';
import { Zap, ShieldCheck, HeartHandshake, Film, Sparkles, Smartphone } from 'lucide-react';

export function WhyChooseUs() {
  const benefits = [
    {
      icon: Zap,
      title: 'Simple & Ultra Fast',
      description:
        'Our distributed cloud extraction engine fetches video and audio streams in seconds without tedious waiting or confusing redirects.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      icon: Film,
      title: 'High Quality Full HD & 4K',
      description:
        'Download true Full HD 1080p, 2K, 4K videos and extract studio-fidelity 320kbps MP3 audio with crystal clarity.',
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      icon: HeartHandshake,
      title: '100% Free Forever',
      description:
        'Unlimited video and audio downloads with zero subscription fees, no credit card required, and no hidden limitations.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: Smartphone,
      title: 'Optimized for All Devices',
      description:
        'Engineered for a flawless mobile experience across iPhone (iOS Safari), Android smartphones, tablets, macOS, and Windows PC.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: ShieldCheck,
      title: 'Safe & Privacy Focused',
      description:
        'No registration or account login required. We do not store or track your personal history or downloaded media files.',
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
    {
      icon: Sparkles,
      title: 'Ethical & Legal Compliance',
      description:
        'We respect platform terms, copyright protections, and access controls. Designed for authorized content and personal archiving.',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Goinstaller.com?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            The next-generation media downloader built with speed, format versatility, and privacy at its core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col items-start"
              >
                <div className={`p-3 rounded-xl border mb-4 ${b.color}`}>
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
