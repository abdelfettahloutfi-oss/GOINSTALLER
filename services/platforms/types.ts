export type MediaPlatform =
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'vimeo'
  | 'threads'
  | 'pinterest'
  | 'generic';

export type MediaType = 'video' | 'audio' | 'thumbnail';

export const EXACT_MEDIA_ERROR_MESSAGE =
  "We couldn't retrieve this exact video. Please check the URL or try another supported public video.";

export interface MediaFormat {
  id: string;
  type: MediaType;
  ext: 'mp4' | 'webm' | 'mp3' | 'm4a' | 'wav' | 'jpg' | 'png';
  quality: string;
  resolution?: string;
  filesize: string;
  bitrate?: string;
  hasAudio: boolean;
  hasVideo: boolean;
  isOriginal?: boolean;
  recommended?: boolean;
  downloadUrl: string;
  directStreamUrl?: string;
  token?: string;
}

export interface MediaMetadata {
  id: string;
  mediaId: string;
  title: string;
  author: string;
  authorUrl?: string;
  authorAvatar?: string;
  thumbnail: string;
  duration: string;
  durationSeconds?: number;
  platform: MediaPlatform;
  platformName: string;
  sourceUrl: string;
  canonicalUrl: string;
  formats: MediaFormat[];
  description?: string;
  views?: string;
  likes?: string;
  extractedAt: string;
}

export interface PlatformExtractor {
  id: MediaPlatform;
  name: string;
  icon: string;
  color: string;
  accentBg: string;
  domains: string[];
  placeholderExample: string;
  description: string;
  enabled: boolean;

  matchUrl(url: string): boolean;
  extractId(url: string): string | null;
  normalizeUrl(url: string): string;
  extract(url: string): Promise<MediaMetadata>;
}

export interface ExtractionResult {
  success: boolean;
  data?: MediaMetadata;
  error?: string;
  code?: 'INVALID_URL' | 'UNSUPPORTED_PLATFORM' | 'EXTRACTION_FAILED' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'SERVER_ERROR';
  debug?: Record<string, any>;
}
