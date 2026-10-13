import {
  DatabaseLanguage,
  DatabasePlatform,
  DatabaseToolPage,
  DatabaseMonetizationSettings,
  DatabaseSiteSettings,
  DatabaseTranslation,
  TelemetryRecord,
} from './types';
import {
  DEFAULT_LANGUAGES,
  DEFAULT_PLATFORMS,
  DEFAULT_TOOL_PAGES,
  DEFAULT_TRANSLATIONS,
  DEFAULT_MONETIZATION,
  DEFAULT_SITE_SETTINGS,
} from './defaults';

class DatabaseRepository {
  private languages: Map<string, DatabaseLanguage> = new Map();
  private translations: Map<string, DatabaseTranslation> = new Map();
  private toolPages: Map<string, DatabaseToolPage> = new Map();
  private platforms: Map<string, DatabasePlatform> = new Map();
  private monetization: DatabaseMonetizationSettings = { ...DEFAULT_MONETIZATION };
  private siteSettings: DatabaseSiteSettings = { ...DEFAULT_SITE_SETTINGS };
  private telemetry: TelemetryRecord[] = [];
  private isInitialized = false;

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (this.isInitialized) return;

    // Load Languages
    for (const lang of DEFAULT_LANGUAGES) {
      this.languages.set(lang.code, { ...lang });
    }

    // Load Translations
    for (const tr of DEFAULT_TRANSLATIONS) {
      const key = `${tr.languageCode}:${tr.namespace}:${tr.key}`;
      this.translations.set(key, { ...tr });
    }

    // Load Tool Pages
    for (const page of DEFAULT_TOOL_PAGES) {
      this.toolPages.set(page.slug, { ...page });
    }

    // Load Platforms
    for (const plat of DEFAULT_PLATFORMS) {
      this.platforms.set(plat.slug, { ...plat });
    }

    // Seed recent telemetry
    this.telemetry = [
      {
        id: 'tel_101',
        timestamp: new Date(Date.now() - 1000 * 15).toISOString(),
        platform: 'YouTube',
        format: 'MP4 1080p',
        status: 'success',
        latencyMs: 124,
        ipHash: '142.250.***',
        pageSlug: 'youtube-video-downloader',
      },
      {
        id: 'tel_102',
        timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
        platform: 'TikTok',
        format: 'MP4 No-WM',
        status: 'success',
        latencyMs: 95,
        ipHash: '172.56.***',
        pageSlug: 'tiktok-video-downloader',
      },
      {
        id: 'tel_103',
        timestamp: new Date(Date.now() - 1000 * 90).toISOString(),
        platform: 'Twitter / X',
        format: 'MP3 320k',
        status: 'success',
        latencyMs: 142,
        ipHash: '98.114.***',
        pageSlug: 'twitter-to-mp3',
      },
      {
        id: 'tel_104',
        timestamp: new Date(Date.now() - 1000 * 130).toISOString(),
        platform: 'Instagram',
        format: 'MP4 Reels',
        status: 'success',
        latencyMs: 168,
        ipHash: '204.79.***',
        pageSlug: 'instagram-reels-downloader',
      },
      {
        id: 'tel_105',
        timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
        platform: 'Facebook',
        format: 'MP4 1080p',
        status: 'success',
        latencyMs: 155,
        ipHash: '198.51.***',
        pageSlug: 'facebook-video-downloader',
      },
      {
        id: 'tel_106',
        timestamp: new Date(Date.now() - 1000 * 240).toISOString(),
        platform: 'Vimeo',
        format: 'MP4 4K',
        status: 'success',
        latencyMs: 198,
        ipHash: '64.233.***',
        pageSlug: 'vimeo-video-downloader',
      },
    ];

    this.isInitialized = true;
  }

  // ==================== TOOL PAGES & SEO ====================

  public getAllToolPages(filters?: {
    languageCode?: string;
    platform?: string;
    isPublished?: boolean;
    search?: string;
  }): DatabaseToolPage[] {
    let pages = Array.from(this.toolPages.values());

    if (filters) {
      if (filters.languageCode) {
        pages = pages.filter((p) => p.languageCode === filters.languageCode);
      }
      if (filters.platform && filters.platform !== 'all') {
        pages = pages.filter((p) => p.platform === filters.platform);
      }
      if (filters.isPublished !== undefined) {
        pages = pages.filter((p) => p.isPublished === filters.isPublished);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        pages = pages.filter(
          (p) =>
            p.slug.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            p.targetKeyword.toLowerCase().includes(q) ||
            p.badge.toLowerCase().includes(q)
        );
      }
    }

    return pages;
  }

  public getToolPageBySlug(slug: string, languageCode?: string): DatabaseToolPage | undefined {
    // Exact match
    const direct = this.toolPages.get(slug);
    if (direct) {
      if (languageCode && direct.languageCode !== languageCode) {
        // Look for localized variant if exists
        const localized = Array.from(this.toolPages.values()).find(
          (p) => p.slug === slug && p.languageCode === languageCode
        );
        return localized || direct;
      }
      return direct;
    }

    // Secondary scan (e.g. without leading slashes)
    const cleanSlug = slug.replace(/^\/+/, '');
    for (const page of this.toolPages.values()) {
      if (page.slug.replace(/^\/+/, '') === cleanSlug) {
        if (!languageCode || page.languageCode === languageCode) {
          return page;
        }
      }
    }

    return undefined;
  }

  public saveToolPage(pageData: Partial<DatabaseToolPage> & { slug: string; title: string }): DatabaseToolPage {
    const existing = this.getToolPageBySlug(pageData.slug);
    const now = new Date().toISOString();

    const cleanSlug = pageData.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const newPage: DatabaseToolPage = {
      id: existing?.id || `tool_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: cleanSlug,
      languageCode: pageData.languageCode || existing?.languageCode || 'en',
      platform: pageData.platform || existing?.platform || 'youtube',
      platformName: pageData.platformName || existing?.platformName || 'YouTube',
      toolType: pageData.toolType || existing?.toolType || 'Video Downloader',
      badge: pageData.badge || existing?.badge || 'VIDEO DOWNLOADER',
      targetKeyword: pageData.targetKeyword || existing?.targetKeyword || cleanSlug.replace(/-/g, ' '),
      searchIntent: pageData.searchIntent || existing?.searchIntent || 'Download high quality media online',
      title: pageData.title,
      h1: pageData.h1 || pageData.title,
      tagline: pageData.tagline || existing?.tagline || 'Download high quality videos and audio with one click.',
      metaDescription: pageData.metaDescription || existing?.metaDescription || `Download videos and audio from ${pageData.platform || 'online'} quickly and for free.`,
      primaryFormat: pageData.primaryFormat || existing?.primaryFormat || 'MP4',
      keywords: pageData.keywords || existing?.keywords || [cleanSlug.replace(/-/g, ' ')],
      features: pageData.features || existing?.features || [
        { title: 'High Speed Extraction', desc: 'Download media in seconds without throttling.', icon: 'Zap' },
        { title: 'Full HD & 4K Quality', desc: 'Retain original stream resolutions without loss.', icon: 'Video' },
        { title: 'Universal Device Support', desc: 'Works on iOS, Android, macOS, and Windows browsers.', icon: 'Globe' },
      ],
      steps: pageData.steps || existing?.steps || [
        { step: 1, title: 'Copy Link', desc: 'Copy the media link from your browser or app.' },
        { step: 2, title: 'Paste URL', desc: 'Paste into Goinstaller and press Download.' },
        { step: 3, title: 'Save File', desc: 'Choose desired quality and save to device.' },
      ],
      faqs: pageData.faqs || existing?.faqs || [
        { question: 'Is this downloader tool free?', answer: 'Yes! Unlimited downloads are provided with no payment required.' },
      ],
      sampleUrl: pageData.sampleUrl || existing?.sampleUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      canonicalUrl: pageData.canonicalUrl || `https://www.goinstaller.com/${cleanSlug}`,
      isPublished: pageData.isPublished !== undefined ? pageData.isPublished : true,
      isIndexable: pageData.isIndexable !== undefined ? pageData.isIndexable : true,
      viewCount: existing?.viewCount || 0,
      downloadCount: existing?.downloadCount || 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.toolPages.set(cleanSlug, newPage);
    return newPage;
  }

  public deleteToolPage(slug: string): boolean {
    const page = this.getToolPageBySlug(slug);
    if (!page) return false;
    return this.toolPages.delete(page.slug);
  }

  // ==================== LANGUAGES ====================

  public getAllLanguages(): DatabaseLanguage[] {
    return Array.from(this.languages.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getLanguageByCode(code: string): DatabaseLanguage | undefined {
    return this.languages.get(code.toLowerCase());
  }

  public saveLanguage(langData: Partial<DatabaseLanguage> & { code: string; name: string }): DatabaseLanguage {
    const code = langData.code.toLowerCase().trim();
    const existing = this.languages.get(code);
    const now = new Date().toISOString();

    const updated: DatabaseLanguage = {
      id: existing?.id || `lang_${code}`,
      code,
      name: langData.name,
      nativeName: langData.nativeName || langData.name,
      isRtl: langData.isRtl !== undefined ? langData.isRtl : false,
      isDefault: langData.isDefault !== undefined ? langData.isDefault : false,
      isEnabled: langData.isEnabled !== undefined ? langData.isEnabled : true,
      sortOrder: langData.sortOrder !== undefined ? langData.sortOrder : this.languages.size + 1,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (updated.isDefault) {
      // Unset previous default
      for (const [c, l] of this.languages.entries()) {
        if (c !== code && l.isDefault) {
          l.isDefault = false;
        }
      }
    }

    this.languages.set(code, updated);
    return updated;
  }

  public deleteLanguage(code: string): boolean {
    if (code === 'en') return false; // Prevent deleting primary default
    return this.languages.delete(code.toLowerCase());
  }

  // ==================== TRANSLATIONS ====================

  public getTranslations(languageCode = 'en', namespace?: string): Record<string, string> {
    const result: Record<string, string> = {};

    for (const tr of this.translations.values()) {
      if (tr.languageCode === languageCode || tr.languageCode === 'common') {
        if (!namespace || tr.namespace === namespace) {
          result[tr.key] = tr.value;
        }
      }
    }

    return result;
  }

  public getAllTranslationsList(): DatabaseTranslation[] {
    return Array.from(this.translations.values());
  }

  public saveTranslation(data: { languageCode: string; namespace: string; key: string; value: string }): DatabaseTranslation {
    const storeKey = `${data.languageCode}:${data.namespace}:${data.key}`;
    const existing = this.translations.get(storeKey);
    const now = new Date().toISOString();

    const record: DatabaseTranslation = {
      id: existing?.id || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      languageCode: data.languageCode,
      namespace: data.namespace,
      key: data.key,
      value: data.value,
      updatedAt: now,
    };

    this.translations.set(storeKey, record);
    return record;
  }

  // ==================== PLATFORMS ====================

  public getAllPlatforms(): DatabasePlatform[] {
    return Array.from(this.platforms.values());
  }

  public getPlatformBySlug(slug: string): DatabasePlatform | undefined {
    return this.platforms.get(slug.toLowerCase());
  }

  public updatePlatform(slug: string, updates: Partial<DatabasePlatform>): DatabasePlatform | undefined {
    const existing = this.platforms.get(slug.toLowerCase());
    if (!existing) return undefined;

    const updated: DatabasePlatform = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.platforms.set(slug.toLowerCase(), updated);
    return updated;
  }

  // ==================== MONETIZATION ====================

  public getMonetization(): DatabaseMonetizationSettings {
    return { ...this.monetization };
  }

  public updateMonetization(updates: Partial<DatabaseMonetizationSettings>): DatabaseMonetizationSettings {
    this.monetization = {
      ...this.monetization,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.monetization };
  }

  // ==================== SITE SETTINGS ====================

  public getSiteSettings(): DatabaseSiteSettings {
    return { ...this.siteSettings };
  }

  public updateSiteSettings(updates: Partial<DatabaseSiteSettings>): DatabaseSiteSettings {
    this.siteSettings = {
      ...this.siteSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.siteSettings };
  }

  // ==================== TELEMETRY & ANALYTICS ====================

  public recordTelemetry(event: {
    platform: string;
    format: string;
    status: 'success' | 'failed' | 'processing';
    latencyMs: number;
    ipHash: string;
    pageSlug?: string;
  }): TelemetryRecord {
    const record: TelemetryRecord = {
      id: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.telemetry.unshift(record);
    if (this.telemetry.length > 500) {
      this.telemetry.pop();
    }

    // Increment page counter if exists
    if (event.pageSlug) {
      const page = this.getToolPageBySlug(event.pageSlug);
      if (page) {
        page.downloadCount = (page.downloadCount || 0) + 1;
      }
    }

    return record;
  }

  public getTelemetryLogs(limit = 20): TelemetryRecord[] {
    return this.telemetry.slice(0, limit);
  }

  public getTelemetryStats() {
    const totalDownloads = 1482930 + this.telemetry.length;
    const successCount = this.telemetry.filter((t) => t.status === 'success').length + 9940;
    const failedCount = this.telemetry.filter((t) => t.status === 'failed').length + 60;
    const totalRequests = successCount + failedCount;
    const successRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(1) : '99.4';

    const avgLatency =
      this.telemetry.length > 0
        ? Math.round(this.telemetry.reduce((acc, curr) => acc + curr.latencyMs, 0) / this.telemetry.length)
        : 142;

    const publishedPagesCount = Array.from(this.toolPages.values()).filter((p) => p.isPublished).length;
    const activeLanguagesCount = Array.from(this.languages.values()).filter((l) => l.isEnabled).length;
    const activePlatformsCount = Array.from(this.platforms.values()).filter((p) => p.isEnabled).length;

    return {
      totalDownloads,
      successRate: `${successRate}%`,
      avgLatencyMs: avgLatency,
      publishedPagesCount,
      activeLanguagesCount,
      activePlatformsCount,
      recentLogs: this.getTelemetryLogs(10),
    };
  }

  // ==================== SYNC DEFAULTS ====================

  public syncDefaults(): { pagesSynced: number; languagesSynced: number; platformsSynced: number } {
    for (const page of DEFAULT_TOOL_PAGES) {
      if (!this.toolPages.has(page.slug)) {
        this.toolPages.set(page.slug, { ...page });
      }
    }
    for (const lang of DEFAULT_LANGUAGES) {
      if (!this.languages.has(lang.code)) {
        this.languages.set(lang.code, { ...lang });
      }
    }
    for (const plat of DEFAULT_PLATFORMS) {
      if (!this.platforms.has(plat.slug)) {
        this.platforms.set(plat.slug, { ...plat });
      }
    }
    for (const tr of DEFAULT_TRANSLATIONS) {
      const key = `${tr.languageCode}:${tr.namespace}:${tr.key}`;
      if (!this.translations.has(key)) {
        this.translations.set(key, { ...tr });
      }
    }

    return {
      pagesSynced: this.toolPages.size,
      languagesSynced: this.languages.size,
      platformsSynced: this.platforms.size,
    };
  }
}

// Global Singleton Database Repository
export const db = new DatabaseRepository();
