'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  customFaqs?: FaqItem[];
  platformName?: string;
}

export function FaqSection({ customFaqs, platformName }: FaqSectionProps) {
  const defaultFaqs: FaqItem[] = [
    {
      question: `Why should you use Goinstaller.com to download ${platformName || 'videos and audio'}?`,
      answer:
        'Goinstaller.com is an advanced, high-speed media downloader developed with distributed stream extraction technology. It supports Full HD 1080p, 2K, 4K video downloads and high-bitrate MP3 audio extraction (up to 320kbps) across multiple platforms with zero account registration, no malware, and 100% free usage.',
    },
    {
      question: 'How do I download videos on Android or iPhone (iOS)?',
      answer:
        'Goinstaller works smoothly in mobile browsers. On iPhone, open Safari, paste the link, tap Download on your desired format, and tap Download in the Safari prompt. The video will be saved in your Files > Downloads folder and can be saved to your Photos Camera Roll with one tap. On Android, Chrome automatically saves the video directly to your Gallery.',
    },
    {
      question: 'Can I download videos in Full HD 1080p and 4K?',
      answer:
        'Yes! Whenever the source video was uploaded in 1080p, 1440p 2K, or 2160p 4K, Goinstaller provides the highest available resolution stream without downsampling or sacrificing framerate.',
    },
    {
      question: 'Does Goinstaller support downloading private videos or bypassing DRM?',
      answer:
        'No. Goinstaller strictly abides by ethical and copyright standards. We do not bypass digital rights management (DRM), authentication tokens, or private access controls. We only allow downloading media that the user is authorized to access or that is made publicly available for personal download.',
    },
    {
      question: 'Where are videos saved after downloading to my device?',
      answer:
        'On mobile devices, check your "Downloads" folder in the Files app or your mobile gallery. On Mac or Windows PC, check your default "Downloads" directory in your browser.',
    },
    {
      question: 'Can I extract and download only the MP3 audio soundtrack?',
      answer:
        'Yes! For every video parsed, Goinstaller provides dedicated Audio (MP3) formats ranging from standard 128kbps up to ultra-high fidelity 320kbps, ideal for offline music listening, voice clips, and podcasts.',
    },
    {
      question: 'Is there a limit on how many videos I can download per day?',
      answer:
        'There is no limit. Goinstaller offers unlimited downloads for all users. No subscriptions or payment details will ever be requested.',
    },
  ];

  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs : defaultFaqs;
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 1]);

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 text-slate-700 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Everything you need to know about downloading video and audio on Goinstaller.com.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
