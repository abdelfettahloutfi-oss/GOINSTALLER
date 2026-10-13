import { MediaFormat, MediaMetadata } from '../platforms/types';
import { tokenService } from '../download/token-service';

/**
 * Converts byte integer into formatted human-readable size (e.g. "15.4 MB", "1.2 GB")
 */
export function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  const val = bytes / Math.pow(k, idx);
  // Single decimal place for KB/MB, two decimal places for GB/TB
  const decimals = idx >= 3 ? 2 : 1;
  return `${val.toFixed(decimals)} ${sizes[idx]}`;
}

/**
 * Parses duration strings like "3:45", "01:23:45", "45s", "180", "3 min 20s" into total seconds
 */
export function parseDurationToSeconds(duration?: string | number, fallbackSeconds = 90): number {
  if (typeof duration === 'number' && duration > 0) return duration;
  if (!duration || typeof duration !== 'string') return fallbackSeconds;

  const trimmed = duration.trim().toLowerCase();

  // Pure digits check
  if (/^\d+$/.test(trimmed)) {
    const parsed = parseInt(trimmed, 10);
    return parsed > 0 ? parsed : fallbackSeconds;
  }

  // MM:SS or HH:MM:SS format
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map((p) => parseInt(p.trim(), 10) || 0);
    if (parts.length === 2) {
      const [m, s] = parts;
      const total = m * 60 + s;
      return total > 0 ? total : fallbackSeconds;
    } else if (parts.length === 3) {
      const [h, m, s] = parts;
      const total = h * 3600 + m * 60 + s;
      return total > 0 ? total : fallbackSeconds;
    }
  }

  // Handle format like "3m 45s" or "2m" or "45s"
  const mMatch = trimmed.match(/(\d+)\s*m(?:in)?/);
  const sMatch = trimmed.match(/(\d+)\s*s(?:ec)?/);
  if (mMatch || sMatch) {
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    const s = sMatch ? parseInt(sMatch[1], 10) : 0;
    const total = m * 60 + s;
    if (total > 0) return total;
  }

  return fallbackSeconds;
}

/**
 * Estimates file size in bytes from bitrate and duration:
 * Formula: (bitrate_in_bits_per_sec * duration_in_seconds) / 8
 */
export function estimateFilesizeBytes(
  bitrateStr?: string,
  quality?: string,
  durationSeconds?: number,
  type?: 'video' | 'audio' | 'thumbnail',
  resolution?: string
): number {
  const duration = durationSeconds && durationSeconds > 0 ? durationSeconds : 90;

  if (type === 'thumbnail') {
    return 320 * 1024; // ~320 KB for high-res cover image
  }

  let bitrateBps = 0;

  // 1. Try parsing explicit bitrate string (e.g. "320 kbps", "128 kbps", "1.5 Mbps")
  if (bitrateStr) {
    const lower = bitrateStr.toLowerCase();
    const mbpsMatch = lower.match(/([\d.]+)\s*mbps/);
    const kbpsMatch = lower.match(/([\d.]+)\s*kbps/);

    if (mbpsMatch) {
      bitrateBps = Math.round(parseFloat(mbpsMatch[1]) * 1000000);
    } else if (kbpsMatch) {
      bitrateBps = Math.round(parseFloat(kbpsMatch[1]) * 1000);
    }
  }

  // 2. If no explicit bitrate parsed, infer from quality/resolution or type
  if (bitrateBps <= 0) {
    const qLower = (quality || '').toLowerCase();
    const resLower = (resolution || '').toLowerCase();

    if (type === 'audio') {
      if (qLower.includes('320') || resLower.includes('320')) {
        bitrateBps = 320 * 1000;
      } else if (qLower.includes('256') || resLower.includes('256')) {
        bitrateBps = 256 * 1000;
      } else if (qLower.includes('192') || resLower.includes('192')) {
        bitrateBps = 192 * 1000;
      } else if (qLower.includes('128') || resLower.includes('128')) {
        bitrateBps = 128 * 1000;
      } else {
        bitrateBps = 256 * 1000; // Standard audio default
      }
    } else {
      // Video bitrate inference by resolution
      if (qLower.includes('4k') || qLower.includes('2160') || resLower.includes('2160') || resLower.includes('3840')) {
        bitrateBps = 16000 * 1000; // 16 Mbps
      } else if (qLower.includes('2k') || qLower.includes('1440') || resLower.includes('1440') || resLower.includes('2560')) {
        bitrateBps = 8500 * 1000; // 8.5 Mbps
      } else if (qLower.includes('1080') || resLower.includes('1080') || resLower.includes('1920')) {
        bitrateBps = 4200 * 1000; // 4.2 Mbps
      } else if (qLower.includes('720') || resLower.includes('720') || resLower.includes('1280')) {
        bitrateBps = 2200 * 1000; // 2.2 Mbps
      } else if (qLower.includes('480') || resLower.includes('480') || resLower.includes('854')) {
        bitrateBps = 1100 * 1000; // 1.1 Mbps
      } else if (qLower.includes('360') || resLower.includes('360') || resLower.includes('640')) {
        bitrateBps = 650 * 1000; // 650 kbps
      } else if (qLower.includes('240') || resLower.includes('240')) {
        bitrateBps = 380 * 1000; // 380 kbps
      } else {
        bitrateBps = 3200 * 1000; // Default ~3.2 Mbps for general web video
      }
    }
  }

  // Calculate: (bitrate * duration) / 8
  const estimatedBytes = Math.round((bitrateBps * duration) / 8);
  return Math.max(estimatedBytes, 1024 * 50); // Minimum 50 KB
}

/**
 * Returns formatted estimated filesize (e.g. "15.4 MB") based on bitrate and duration
 */
export function estimateFilesize(
  bitrateStr?: string,
  quality?: string,
  durationSeconds?: number,
  type?: 'video' | 'audio' | 'thumbnail',
  resolution?: string
): string {
  const bytes = estimateFilesizeBytes(bitrateStr, quality, durationSeconds, type, resolution);
  return formatBytes(bytes);
}

/**
 * Executes a HEAD request (or fallback Range request) to fetch the true upstream Content-Length
 */
export async function fetchUpstreamContentLength(
  url: string,
  platform?: string
): Promise<number | null> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return null;
  }

  let upstreamHost = '';
  try {
    upstreamHost = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  let referer = 'https://www.google.com/';
  if (upstreamHost.includes('tiktok') || platform === 'tiktok') {
    referer = 'https://www.tiktok.com/';
  } else if (upstreamHost.includes('tikwm')) {
    referer = 'https://www.tikwm.com/';
  } else if (upstreamHost.includes('instagram') || upstreamHost.includes('cdninstagram') || platform === 'instagram') {
    referer = 'https://www.instagram.com/';
  } else if (upstreamHost.includes('facebook') || upstreamHost.includes('fbcdn') || platform === 'facebook') {
    referer = 'https://www.facebook.com/';
  } else if (upstreamHost.includes('threads') || platform === 'threads') {
    referer = 'https://www.threads.net/';
  } else if (upstreamHost.includes('twitter') || upstreamHost.includes('twimg') || upstreamHost.includes('x.com') || platform === 'twitter') {
    referer = 'https://x.com/';
  } else if (upstreamHost.includes('vimeo') || platform === 'vimeo') {
    referer = 'https://vimeo.com/';
  } else if (upstreamHost.includes('youtube') || upstreamHost.includes('googlevideo') || platform === 'youtube') {
    referer = 'https://www.youtube.com/';
  }

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: referer,
    Origin: referer.replace(/\/$/, ''),
  };

  // Attempt 1: HEAD request with short timeout (2.5 seconds)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const headRes = await fetch(url, {
      method: 'HEAD',
      headers,
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (headRes.ok) {
      const cl = headRes.headers.get('content-length');
      if (cl) {
        const bytes = parseInt(cl, 10);
        if (!isNaN(bytes) && bytes > 1024) {
          return bytes;
        }
      }
    }
  } catch {
    // Fallthrough to range check
  }

  // Attempt 2: Quick GET with Range: bytes=0-0 to inspect Content-Range or Content-Length
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const rangeRes = await fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
        Range: 'bytes=0-0',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Check Content-Range header: bytes 0-0/15420100
    const contentRange = rangeRes.headers.get('content-range');
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        const total = parseInt(match[1], 10);
        if (!isNaN(total) && total > 1024) {
          return total;
        }
      }
    }

    const cl = rangeRes.headers.get('content-length');
    if (cl && rangeRes.status === 200) {
      const bytes = parseInt(cl, 10);
      if (!isNaN(bytes) && bytes > 1024) {
        return bytes;
      }
    }
  } catch {
    // Ignore network failures and return null for estimation fallback
  }

  return null;
}

/**
 * Enriches all formats in MediaMetadata with accurate or estimated file sizes
 * guaranteeing no placeholder strings ("Authentic Stream") reach the UI.
 */
export async function enrichMediaFormatsWithFilesize(metadata: MediaMetadata): Promise<MediaMetadata> {
  if (!metadata || !metadata.formats || metadata.formats.length === 0) {
    return metadata;
  }

  const durationSeconds = metadata.durationSeconds || parseDurationToSeconds(metadata.duration, 90);
  metadata.durationSeconds = durationSeconds;

  const enrichedFormats: MediaFormat[] = await Promise.all(
    metadata.formats.map(async (fmt) => {
      // If format already has a clean human-readable size (e.g. "14.5 MB") and not the placeholder, keep it
      const currentSize = (fmt.filesize || '').trim();
      const isPlaceholder =
        !currentSize ||
        currentSize.toLowerCase().includes('authentic') ||
        currentSize.toLowerCase().includes('stream') ||
        currentSize.toLowerCase().includes('direct') ||
        currentSize.toLowerCase().includes('auto');

      // Resolve direct upstream URL for HEAD request
      let directUrl = fmt.directStreamUrl;
      if (!directUrl && fmt.token) {
        const decoded = tokenService.decodePayloadWithoutVerification(fmt.token);
        if (decoded?.directMediaUrl && !decoded.directMediaUrl.includes('/api/v1/download')) {
          directUrl = decoded.directMediaUrl;
        }
      }

      let resolvedBytes: number | null = null;

      // 1. Attempt upstream HEAD request if valid direct URL exists
      if (directUrl && directUrl.startsWith('http')) {
        resolvedBytes = await fetchUpstreamContentLength(directUrl, metadata.platform);
      }

      // 2. If Content-Length retrieved, format to readable size (e.g. "15.4 MB")
      if (resolvedBytes && resolvedBytes > 1024) {
        return {
          ...fmt,
          filesize: formatBytes(resolvedBytes),
        };
      }

      // 3. Fallback: calculate estimated size based on bitrate and duration
      if (isPlaceholder || !currentSize) {
        const estimated = estimateFilesize(
          fmt.bitrate,
          fmt.quality,
          durationSeconds,
          fmt.type,
          fmt.resolution
        );
        return {
          ...fmt,
          filesize: estimated,
        };
      }

      return fmt;
    })
  );

  return {
    ...metadata,
    durationSeconds,
    formats: enrichedFormats,
  };
}
