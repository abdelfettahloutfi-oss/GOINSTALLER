/**
 * Goinstaller PostgreSQL / Database Data-Access Layer
 * Central source of truth for SEO landing pages, languages, translations, platforms, settings, and telemetry.
 */

export interface DatabaseLanguage {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRtl: boolean;
  isDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseTranslation {
  id: string;
  languageCode: string;
  namespace: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface DatabaseToolPage {
  id: string;
  slug: string;
  languageCode: string;
  platform: string;
  platformName: string;
  toolType: string;
  badge: string;
  targetKeyword: string;
  searchIntent: string;
  title: string;
  h1: string;
  tagline: string;
  metaDescription: string;
  primaryFormat: 'MP4' | 'MP3' | 'ALL';
  keywords: string[];
  features: Array<{ title: string; desc: string; icon: string }>;
  steps: Array<{ step: number; title: string; desc: string }>;
  faqs: Array<{ question: string; answer: string }>;
  sampleUrl: string;
  canonicalUrl?: string;
  isPublished: boolean;
  isIndexable: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabasePlatform {
  id: string;
  slug: string;
  name: string;
  icon: string;
  badge: string;
  color: string;
  isEnabled: boolean;
  description: string;
  supportedTools: string[];
  urlPatterns: string[];
  rateLimitPerMin: number;
  updatedAt: string;
}

export interface DatabaseMonetizationSettings {
  id: string;
  adsEnabled: boolean;
  headerBannerEnabled: boolean;
  headerBannerCode: string;
  resultBannerEnabled: boolean;
  resultBannerCode: string;
  footerBannerEnabled: boolean;
  footerBannerCode: string;
  interstitialEnabled: boolean;
  updatedAt: string;
}

export interface DatabaseSiteSettings {
  id: string;
  siteName: string;
  siteDomain: string;
  tagline: string;
  description: string;
  supportEmail: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  mp3ConversionEnabled: boolean;
  highRes4kEnabled: boolean;
  rateLimitPerMinute: number;
  maxFileSizeBytes: number;
  supportedFormats: string[];
  updatedAt: string;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  platform: string;
  format: string;
  status: 'success' | 'failed' | 'processing';
  latencyMs: number;
  ipHash: string;
  pageSlug?: string;
}
