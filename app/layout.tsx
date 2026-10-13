import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://www.goinstaller.com'),
  title: {
    default: 'Goinstaller.com – Free Online Video & Audio Downloader',
    template: '%s | Goinstaller.com',
  },
  description:
    'Download videos and extract audio from YouTube, Facebook, Instagram, TikTok, Twitter/X, and Vimeo in Full HD 1080p, 4K, and 320kbps MP3. Fast, free, and mobile-friendly.',
  keywords: [
    'video downloader',
    'audio downloader',
    'youtube downloader',
    'facebook video download',
    'instagram reels downloader',
    'tiktok without watermark',
    'twitter video downloader',
    'mp4 download',
    'mp3 converter',
    'goinstaller',
  ],
  authors: [{ name: 'Goinstaller Media' }],
  creator: 'Goinstaller.com',
  publisher: 'Goinstaller.com',
  openGraph: {
    title: 'Goinstaller.com – Free Online Video & Audio Downloader',
    description:
      'Download high-definition videos (1080p, 2K, 4K) and high-quality MP3 audio from YouTube, Facebook, Instagram, TikTok, and Twitter/X with zero registration.',
    url: 'https://www.goinstaller.com',
    siteName: 'Goinstaller.com',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goinstaller.com – Online Media Downloader',
    description:
      'High-speed video and audio downloader supporting YouTube, Facebook, Instagram, TikTok, and more.',
  },
  alternates: {
    canonical: 'https://www.goinstaller.com',
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Goinstaller.com',
    url: 'https://www.goinstaller.com',
    description:
      'Free multi-platform media downloader to extract high-definition video and audio from popular content platforms.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

