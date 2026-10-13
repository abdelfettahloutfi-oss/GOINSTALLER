export interface PublicSiteSettings {
  siteName: string;
  siteDomain: string;
  tagline: string;
  description: string;
  supportEmail: string;
  apiVersion: string;
  features: {
    mp3Conversion: boolean;
    highRes4K: boolean;
    directMedia: boolean;
    batchDownload: boolean;
    maintenanceMode: boolean;
  };
  limits: {
    maxFileSizeBytes: number;
    rateLimitPerMinute: number;
  };
  supportedFormats: string[];
}

export interface BackendSystemSettings extends PublicSiteSettings {
  databaseUrlConfigured: boolean;
  adminUsername: string;
  rateLimitWindowMs: number;
  logRetentionDays: number;
}

class SettingsService {
  private settings: BackendSystemSettings;

  constructor() {
    this.settings = {
      siteName: 'Goinstaller',
      siteDomain: 'goinstaller.com',
      tagline: 'High-Speed Online Video & Audio Downloader',
      description: 'Download HD videos and high-bitrate audio from YouTube, TikTok, Facebook, Instagram, Vimeo, and X.',
      supportEmail: 'contact@goinstaller.com',
      apiVersion: 'v1',
      features: {
        mp3Conversion: true,
        highRes4K: true,
        directMedia: true,
        batchDownload: false,
        maintenanceMode: false,
      },
      limits: {
        maxFileSizeBytes: 1024 * 1024 * 500, // 500 MB
        rateLimitPerMinute: 30,
      },
      supportedFormats: ['mp4', 'mp3', 'm4a', 'webm', 'wav', 'jpg'],
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      adminUsername: process.env.ADMIN_USERNAME || 'admin',
      rateLimitWindowMs: 60 * 1000,
      logRetentionDays: 30,
    };
  }

  public getPublicSettings(): PublicSiteSettings {
    const {
      databaseUrlConfigured,
      adminUsername,
      rateLimitWindowMs,
      logRetentionDays,
      ...publicOnly
    } = this.settings;

    return publicOnly;
  }

  public getBackendSettings(): BackendSystemSettings {
    return {
      ...this.settings,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    };
  }

  public updateFeatures(features: Partial<BackendSystemSettings['features']>): void {
    this.settings.features = {
      ...this.settings.features,
      ...features,
    };
  }

  public updateLimits(limits: Partial<BackendSystemSettings['limits']>): void {
    this.settings.limits = {
      ...this.settings.limits,
      ...limits,
    };
  }
}

export const settingsService = new SettingsService();
