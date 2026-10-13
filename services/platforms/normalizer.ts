import { MediaPlatform } from './types';

// Tracking parameters that must be completely removed from all URLs
const TRACKING_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'igsh',
  'igshid',
  'si',
  'feature',
  'context',
  'ref',
  'ref_src',
  'ref_url',
  'mibextid',
  'spm',
  'gclid',
  'dclid',
  'msclkid',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
  '_r',
  '_t',
  'is_from_webapp',
  'sender_device',
  'checksum',
  'tt_from',
  'pp',
  'ab_channel',
  'sub_confirmation',
  'share_source',
  'sfnsn',
  'paipv',
  'eav',
  '__cft__',
  '__tn__',
]);

export interface NormalizedUrlInfo {
  originalUrl: string;
  normalizedUrl: string;
  canonicalUrl: string;
  platform: MediaPlatform;
  mediaId: string | null;
  isValid: boolean;
}

/**
 * Remove tracking parameters from a URL object while preserving content-identifying parameters.
 */
export function cleanTrackingParameters(parsedUrl: URL): URL {
  const cleaned = new URL(parsedUrl.toString());
  const keysToDelete: string[] = [];

  cleaned.searchParams.forEach((_, key) => {
    const lowerKey = key.toLowerCase();
    if (
      TRACKING_QUERY_PARAMS.has(lowerKey) ||
      lowerKey.startsWith('utm_') ||
      lowerKey.startsWith('fb_')
    ) {
      keysToDelete.push(key);
    }
  });

  for (const k of keysToDelete) {
    cleaned.searchParams.delete(k);
  }

  return cleaned;
}

/**
 * Extract YouTube Video ID (strictly 11 chars: [a-zA-Z0-9_-]{11})
 */
export function extractYouTubeId(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    // youtu.be/VIDEO_ID
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const id = url.pathname.slice(1).split('/')[0]?.split('?')[0];
      return isValidYouTubeId(id) ? id : null;
    }

    if (
      host.includes('youtube.com') ||
      host.includes('youtube-nocookie.com')
    ) {
      // /watch?v=VIDEO_ID
      if (url.searchParams.has('v')) {
        const id = url.searchParams.get('v');
        if (isValidYouTubeId(id)) return id;
      }

      // /shorts/VIDEO_ID
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

      // /embed/VIDEO_ID or /v/VIDEO_ID or /live/VIDEO_ID
      const embedMatch = url.pathname.match(/\/(?:embed|v|live)\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch && embedMatch[1]) return embedMatch[1];
    }
  } catch {
    // invalid URL
  }
  return null;
}

function isValidYouTubeId(id: string | null | undefined): id is string {
  if (!id) return false;
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

/**
 * Extract Instagram Shortcode (Reels / Posts / TV / Shares)
 * Examples:
 * - /p/C3x9zP1LXyq/
 * - /reel/C3x9zP1LXyq/
 * - /reels/C3x9zP1LXyq/
 * - /tv/C3x9zP1LXyq/
 * - /share/p/C3x9zP1LXyq/
 * - /share/r/C3x9zP1LXyq/
 * - /share/reel/C3x9zP1LXyq/
 * - /@username/reel/C3x9zP1LXyq/
 * - /username/p/C3x9zP1LXyq/
 */
export function extractInstagramShortcode(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    if (
      host.includes('instagram.com') ||
      host.includes('instagr.am') ||
      host.includes('ig.me')
    ) {
      // Direct pattern matching
      const patterns = [
        /\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]{5,40})/i,
        /\/share\/(?:p|r|reel)\/([a-zA-Z0-9_-]{5,40})/i,
        /\/[a-zA-Z0-9_.]+\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]{5,40})/i,
      ];

      for (const pattern of patterns) {
        const match = url.pathname.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      // Check if path itself is a short code (e.g. instagr.am/p/CODE or instagr.am/CODE)
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length === 1 && /^[a-zA-Z0-9_-]{5,40}$/.test(pathSegments[0])) {
        // Exclude reserved paths
        const reserved = new Set(['about', 'legal', 'explore', 'direct', 'accounts', 'developer', 'reels']);
        if (!reserved.has(pathSegments[0].toLowerCase())) {
          return pathSegments[0];
        }
      }
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Extract TikTok Video ID (e.g. 7234567890123456789) or short share token (e.g. ZM8x12345, ZT8x12345)
 */
export function extractTikTokId(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    if (
      host.includes('tiktok.com') ||
      host.includes('vm.tiktok.com') ||
      host.includes('vt.tiktok.com')
    ) {
      // 1. Standard video URL: /@user/video/7234567890123456789 or /video/7234567890123456789
      const videoMatch = url.pathname.match(/\/(?:video|v)\/(\d{15,25})/);
      if (videoMatch && videoMatch[1]) return videoMatch[1];

      // 2. /v/7234567890123456789.html
      const htmlMatch = url.pathname.match(/\/(\d{15,25})(?:\.html)?/);
      if (htmlMatch && htmlMatch[1]) return htmlMatch[1];

      // 3. Shortened share URLs: vm.tiktok.com/ZMxxxxxx or vt.tiktok.com/ZSxxxxxx or tiktok.com/t/ZTxxxxxx
      if (host.includes('vm.tiktok.com') || host.includes('vt.tiktok.com')) {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0 && /^[a-zA-Z0-9_-]{4,20}$/.test(parts[0])) {
          return parts[0];
        }
      }

      // 4. tiktok.com/t/ZTxxxxxx
      const tMatch = url.pathname.match(/\/t\/([a-zA-Z0-9_-]{4,20})/);
      if (tMatch && tMatch[1]) return tMatch[1];
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Extract Facebook Video or Reel ID
 */
export function extractFacebookId(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    if (
      host.includes('facebook.com') ||
      host.includes('fb.watch') ||
      host.includes('fb.com')
    ) {
      if (url.searchParams.has('v')) {
        const v = url.searchParams.get('v');
        if (v && /^\d+$/.test(v)) return v;
      }

      const reelMatch = url.pathname.match(/\/reels?\/(\d+)/);
      if (reelMatch && reelMatch[1]) return reelMatch[1];

      const shareMatch = url.pathname.match(/\/share\/[vr]\/([a-zA-Z0-9_-]+)/);
      if (shareMatch && shareMatch[1]) return shareMatch[1];

      const videoMatch = url.pathname.match(/\/videos\/(\d+)/);
      if (videoMatch && videoMatch[1]) return videoMatch[1];

      if (host === 'fb.watch' || host.endsWith('.fb.watch')) {
        const code = url.pathname.slice(1).split('/')[0]?.split('?')[0];
        if (code && code.length >= 3) return code;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Extract Vimeo Numeric Video ID
 */
export function extractVimeoId(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    if (host.includes('vimeo.com')) {
      const match = url.pathname.match(/(?:videos?|channels\/[^/]+|groups\/[^/]+\/videos)?\/(\d{5,12})/);
      if (match && match[1]) return match[1];
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Extract Twitter / X Status Tweet ID
 */
export function extractTwitterId(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    if (host.includes('twitter.com') || host.includes('x.com')) {
      const match = url.pathname.match(/\/status\/(\d+)/);
      if (match && match[1]) return match[1];
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Extract Threads Post ID
 */
export function extractThreadsId(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    const url = cleanTrackingParameters(new URL(trimmed));
    const host = url.hostname.toLowerCase();

    if (host.includes('threads.net')) {
      const match = url.pathname.match(/\/post\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Master URL Normalizer & Media Identifier
 */
export function normalizeAndIdentifyMedia(urlStr: string): NormalizedUrlInfo {
  const trimmed = (urlStr || '').trim();

  try {
    const urlObj = new URL(trimmed);
    const cleaned = cleanTrackingParameters(urlObj);
    const host = cleaned.hostname.toLowerCase();

    // 1. YouTube
    if (
      host.includes('youtube.com') ||
      host.includes('youtu.be') ||
      host.includes('youtube-nocookie.com')
    ) {
      const ytId = extractYouTubeId(trimmed);
      if (ytId) {
        return {
          originalUrl: trimmed,
          normalizedUrl: `https://www.youtube.com/watch?v=${ytId}`,
          canonicalUrl: `https://www.youtube.com/watch?v=${ytId}`,
          platform: 'youtube',
          mediaId: ytId,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'youtube',
        mediaId: null,
        isValid: false,
      };
    }

    // 2. Instagram
    if (
      host.includes('instagram.com') ||
      host.includes('instagr.am') ||
      host.includes('ig.me')
    ) {
      const igCode = extractInstagramShortcode(trimmed);
      if (igCode) {
        return {
          originalUrl: trimmed,
          normalizedUrl: `https://www.instagram.com/p/${igCode}/`,
          canonicalUrl: `https://www.instagram.com/p/${igCode}/`,
          platform: 'instagram',
          mediaId: igCode,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'instagram',
        mediaId: null,
        isValid: false,
      };
    }

    // 3. TikTok
    if (
      host.includes('tiktok.com') ||
      host.includes('vm.tiktok.com') ||
      host.includes('vt.tiktok.com')
    ) {
      const ttId = extractTikTokId(trimmed);
      if (ttId) {
        const canonical = /^\d+$/.test(ttId)
          ? `https://www.tiktok.com/@video/video/${ttId}`
          : cleaned.toString();
        return {
          originalUrl: trimmed,
          normalizedUrl: cleaned.toString(),
          canonicalUrl: canonical,
          platform: 'tiktok',
          mediaId: ttId,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'tiktok',
        mediaId: null,
        isValid: false,
      };
    }

    // 4. Twitter / X
    if (host.includes('twitter.com') || host.includes('x.com')) {
      const tweetId = extractTwitterId(trimmed);
      if (tweetId) {
        return {
          originalUrl: trimmed,
          normalizedUrl: `https://x.com/i/status/${tweetId}`,
          canonicalUrl: `https://x.com/i/status/${tweetId}`,
          platform: 'twitter',
          mediaId: tweetId,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'twitter',
        mediaId: null,
        isValid: false,
      };
    }

    // 5. Facebook
    if (
      host.includes('facebook.com') ||
      host.includes('fb.watch') ||
      host.includes('fb.com')
    ) {
      const fbId = extractFacebookId(trimmed);
      if (fbId) {
        return {
          originalUrl: trimmed,
          normalizedUrl: cleaned.toString(),
          canonicalUrl: `https://www.facebook.com/watch/?v=${fbId}`,
          platform: 'facebook',
          mediaId: fbId,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'facebook',
        mediaId: null,
        isValid: false,
      };
    }

    // 6. Vimeo
    if (host.includes('vimeo.com')) {
      const vimeoId = extractVimeoId(trimmed);
      if (vimeoId) {
        return {
          originalUrl: trimmed,
          normalizedUrl: `https://vimeo.com/${vimeoId}`,
          canonicalUrl: `https://vimeo.com/${vimeoId}`,
          platform: 'vimeo',
          mediaId: vimeoId,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'vimeo',
        mediaId: null,
        isValid: false,
      };
    }

    // 7. Threads
    if (host.includes('threads.net')) {
      const thId = extractThreadsId(trimmed);
      if (thId) {
        return {
          originalUrl: trimmed,
          normalizedUrl: cleaned.toString(),
          canonicalUrl: `https://www.threads.net/post/${thId}`,
          platform: 'threads',
          mediaId: thId,
          isValid: true,
        };
      }
      return {
        originalUrl: trimmed,
        normalizedUrl: cleaned.toString(),
        canonicalUrl: cleaned.toString(),
        platform: 'threads',
        mediaId: null,
        isValid: false,
      };
    }

    // 8. Generic Direct File Links
    const pathname = cleaned.pathname.toLowerCase();
    const isDirectMedia =
      pathname.endsWith('.mp4') ||
      pathname.endsWith('.webm') ||
      pathname.endsWith('.mov') ||
      pathname.endsWith('.mp3') ||
      pathname.endsWith('.m4a') ||
      pathname.endsWith('.wav');

    return {
      originalUrl: trimmed,
      normalizedUrl: cleaned.toString(),
      canonicalUrl: cleaned.toString(),
      platform: 'generic',
      mediaId: isDirectMedia ? pathname.split('/').filter(Boolean).pop() || 'file' : null,
      isValid: isDirectMedia,
    };
  } catch {
    return {
      originalUrl: trimmed,
      normalizedUrl: trimmed,
      canonicalUrl: trimmed,
      platform: 'generic',
      mediaId: null,
      isValid: false,
    };
  }
}
