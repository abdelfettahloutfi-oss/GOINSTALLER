import { MediaMetadata, MediaPlatform } from '../platforms/types';

interface CacheEntry {
  data: MediaMetadata;
  expiresAt: number;
  canonicalUrl: string;
}

class MediaCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTtlMs: number = 1000 * 60 * 60; // 1 hour TTL

  private makeKey(platform: MediaPlatform, mediaId: string): string {
    return `${platform}:${mediaId.trim()}`;
  }

  public get(platform: MediaPlatform, mediaId: string): MediaMetadata | null {
    if (!mediaId) return null;
    const key = this.makeKey(platform, mediaId);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public set(
    platform: MediaPlatform,
    mediaId: string,
    canonicalUrl: string,
    data: MediaMetadata,
    ttlMs: number = this.defaultTtlMs
  ): void {
    if (!mediaId || !data) return;
    const key = this.makeKey(platform, mediaId);

    // Limit maximum cache entries to 1000 items (FIFO prune)
    if (this.cache.size >= 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      canonicalUrl,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public has(platform: MediaPlatform, mediaId: string): boolean {
    return this.get(platform, mediaId) !== null;
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const mediaCache = new MediaCacheService();
