import { ExtractionResult, MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE } from './types';
import { youtubeExtractor } from './youtube';
import { facebookExtractor } from './facebook';
import { instagramExtractor } from './instagram';
import { tiktokExtractor } from './tiktok';
import { twitterExtractor } from './twitter';
import { vimeoExtractor } from './vimeo';
import { threadsExtractor } from './threads';
import { genericExtractor } from './generic';
import { normalizeAndIdentifyMedia } from './normalizer';
import { validateMediaResult, logExtractionTrace } from './validator';
import { extractionLogger } from '../logging/extractor-logger';
import { enrichMediaFormatsWithFilesize } from '../media/filesize-resolver';

class ExtractorRegistry {
  private extractors: Map<string, PlatformExtractor> = new Map();

  constructor() {
    this.register(youtubeExtractor);
    this.register(facebookExtractor);
    this.register(instagramExtractor);
    this.register(tiktokExtractor);
    this.register(twitterExtractor);
    this.register(vimeoExtractor);
    this.register(threadsExtractor);
    this.register(genericExtractor);
  }

  public register(extractor: PlatformExtractor): void {
    this.extractors.set(extractor.id, extractor);
  }

  public getExtractor(id: string): PlatformExtractor | undefined {
    return this.extractors.get(id);
  }

  public getAllExtractors(): PlatformExtractor[] {
    return Array.from(this.extractors.values());
  }

  public getActiveExtractors(): PlatformExtractor[] {
    return Array.from(this.extractors.values()).filter((e) => e.enabled);
  }

  public setExtractorStatus(id: string, enabled: boolean): boolean {
    const extractor = this.extractors.get(id);
    if (extractor) {
      extractor.enabled = enabled;
      return true;
    }
    return false;
  }

  public findExtractorForUrl(url: string): PlatformExtractor | null {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = url.trim();

    // First try the normalized URL detection
    const normalized = normalizeAndIdentifyMedia(cleanUrl);
    if (normalized.isValid && normalized.platform !== 'generic') {
      const match = this.extractors.get(normalized.platform);
      if (match && match.enabled) {
        return match;
      }
    }

    // Try specific platform extractors next (skip generic)
    for (const extractor of this.extractors.values()) {
      if (extractor.id !== 'generic' && extractor.enabled && extractor.matchUrl(cleanUrl)) {
        return extractor;
      }
    }

    // Fallback to generic only if enabled and matches direct media
    const generic = this.extractors.get('generic');
    if (generic && generic.enabled && generic.matchUrl(cleanUrl)) {
      return generic;
    }

    return null;
  }

  public async extract(url: string): Promise<ExtractionResult> {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return {
        success: false,
        error: 'Please paste a valid video or audio URL.',
        code: 'INVALID_URL',
      };
    }

    const cleanUrl = url.trim();

    // Basic protocol check
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return {
        success: false,
        error: 'URL must start with http:// or https://. Please verify and try again.',
        code: 'INVALID_URL',
      };
    }

    // 1. Identify and normalize the URL
    const normalizedInfo = normalizeAndIdentifyMedia(cleanUrl);
    const extractor = this.findExtractorForUrl(cleanUrl);

    if (!extractor) {
      logExtractionTrace({
        submittedUrl: cleanUrl,
        detectedPlatform: normalizedInfo.platform || 'unknown',
        normalizedUrl: normalizedInfo.normalizedUrl,
        canonicalUrl: normalizedInfo.canonicalUrl,
        extractedMediaId: normalizedInfo.mediaId,
        extractorUsed: 'NONE',
        returnedMediaId: null,
        returnedMediaUrl: 'NONE',
        validationResult: false,
        validationDetails: 'Unsupported platform or invalid URL format',
      });

      extractionLogger.log({
        submittedUrl: cleanUrl,
        detectedPlatform: normalizedInfo.platform || 'unknown',
        extractedMediaId: normalizedInfo.mediaId,
        canonicalUrl: normalizedInfo.canonicalUrl,
        apiResponseStatus: 'UNSUPPORTED',
        finalMediaUrl: 'NONE',
        validationResult: false,
        error: 'Unsupported platform or URL format',
      });

      return {
        success: false,
        error: EXACT_MEDIA_ERROR_MESSAGE,
        code: 'UNSUPPORTED_PLATFORM',
      };
    }

    if (!extractor.enabled) {
      return {
        success: false,
        error: `Downloads for ${extractor.name} are temporarily undergoing scheduled maintenance. Please try again shortly.`,
        code: 'RATE_LIMITED',
      };
    }

    try {
      // 2. Perform extraction strictly for this URL
      const data: MediaMetadata = await extractor.extract(cleanUrl);

      // 3. Post-extraction strict validation
      const validation = validateMediaResult(cleanUrl, data);

      logExtractionTrace({
        submittedUrl: cleanUrl,
        detectedPlatform: extractor.id,
        normalizedUrl: normalizedInfo.normalizedUrl,
        canonicalUrl: data.canonicalUrl || normalizedInfo.canonicalUrl,
        extractedMediaId: normalizedInfo.mediaId,
        extractorUsed: `${extractor.name}Extractor`,
        returnedMediaId: data.mediaId || data.id,
        returnedMediaUrl: data.formats?.[0]?.downloadUrl || 'NONE',
        validationResult: validation.valid,
        validationDetails: validation.reason,
      });

      if (!validation.valid) {
        extractionLogger.log({
          submittedUrl: cleanUrl,
          detectedPlatform: extractor.id,
          extractedMediaId: normalizedInfo.mediaId,
          canonicalUrl: normalizedInfo.canonicalUrl,
          apiResponseStatus: 'VALIDATION_FAILED',
          finalMediaUrl: data.formats?.[0]?.downloadUrl || 'NONE',
          validationResult: false,
          validationDetails: validation.reason,
          error: validation.reason,
        });

        return {
          success: false,
          error: EXACT_MEDIA_ERROR_MESSAGE,
          code: 'INVALID_URL',
        };
      }

      // 4. Enrich all media formats with true Content-Length or estimated size
      const enrichedData = await enrichMediaFormatsWithFilesize(data);

      // Successful extraction & validation
      extractionLogger.log({
        submittedUrl: cleanUrl,
        detectedPlatform: extractor.id,
        extractedMediaId: enrichedData.mediaId || normalizedInfo.mediaId,
        canonicalUrl: enrichedData.canonicalUrl || normalizedInfo.canonicalUrl,
        apiResponseStatus: 200,
        apiResponseSummary: `Parsed "${enrichedData.title.slice(0, 40)}" with ${enrichedData.formats.length} formats`,
        finalMediaUrl: enrichedData.formats[0]?.downloadUrl || 'NONE',
        validationResult: true,
      });

      return {
        success: true,
        data: enrichedData,
        debug: {
          submittedUrl: cleanUrl,
          detectedPlatform: extractor.id,
          extractedMediaId: enrichedData.mediaId || normalizedInfo.mediaId,
          canonicalUrl: enrichedData.canonicalUrl || normalizedInfo.canonicalUrl,
          validationResult: true,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      const errorMsg = err?.message || EXACT_MEDIA_ERROR_MESSAGE;

      logExtractionTrace({
        submittedUrl: cleanUrl,
        detectedPlatform: extractor.id,
        normalizedUrl: normalizedInfo.normalizedUrl,
        canonicalUrl: normalizedInfo.canonicalUrl,
        extractedMediaId: normalizedInfo.mediaId,
        extractorUsed: `${extractor.name}Extractor`,
        returnedMediaId: null,
        returnedMediaUrl: 'NONE',
        validationResult: false,
        validationDetails: errorMsg,
      });

      extractionLogger.log({
        submittedUrl: cleanUrl,
        detectedPlatform: extractor.id,
        extractedMediaId: normalizedInfo.mediaId,
        canonicalUrl: normalizedInfo.canonicalUrl,
        apiResponseStatus: 'ERROR',
        finalMediaUrl: 'NONE',
        validationResult: false,
        error: errorMsg,
      });

      return {
        success: false,
        error: errorMsg,
        code: 'NETWORK_ERROR',
      };
    }
  }

  public getSampleLinks(): Array<{ platform: string; label: string; url: string }> {
    return [
      {
        platform: 'YouTube',
        label: 'YouTube (Music Video)',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        platform: 'Vimeo',
        label: 'Vimeo HD Film',
        url: 'https://vimeo.com/76979871',
      },
      {
        platform: 'TikTok',
        label: 'TikTok Video',
        url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
      },
      {
        platform: 'Instagram',
        label: 'Instagram Reel',
        url: 'https://www.instagram.com/reel/C3x9zP1LXyq/',
      },
      {
        platform: 'Facebook',
        label: 'Facebook Reel / Video',
        url: 'https://www.facebook.com/watch/?v=10158784378129871',
      },
      {
        platform: 'X / Twitter',
        label: 'X (Twitter) Clip',
        url: 'https://x.com/SpaceX/status/1789456123456789012',
      },
      {
        platform: 'Direct MP4',
        label: 'Direct MP4 Stream',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
    ];
  }
}

export const extractorRegistry = new ExtractorRegistry();
