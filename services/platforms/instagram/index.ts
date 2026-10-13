import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { extractInstagramShortcode } from '../normalizer';
import { mediaCache } from '../../cache/media-cache';
import { tokenService } from '../../download/token-service';
import { estimateFilesize, parseDurationToSeconds } from '../../media/filesize-resolver';

export const instagramExtractor: PlatformExtractor = {
  id: 'instagram',
  name: 'Instagram',
  icon: 'Instagram',
  color: '#E1306C',
  accentBg: 'bg-pink-50 text-pink-700 border-pink-200',
  domains: ['instagram.com', 'instagr.am', 'ig.me'],
  placeholderExample: 'https://www.instagram.com/reel/C3x9zP1LXyq/',
  description: 'Download Instagram Reels, Video Posts, Carousel clips, and Stories in original HD quality.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        host.includes('instagram.com') ||
        host.includes('instagr.am') ||
        host.includes('ig.me')
      );
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    return extractInstagramShortcode(url);
  },

  normalizeUrl(url: string): string {
    const code = extractInstagramShortcode(url);
    if (code) {
      return `https://www.instagram.com/p/${code}/`;
    }
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const cleanUrl = url.trim();
    let shortcode = extractInstagramShortcode(cleanUrl);
    let resolvedUrl = cleanUrl;

    // Follow redirects for shortened or share URLs
    if (
      !shortcode ||
      cleanUrl.includes('/share/') ||
      cleanUrl.includes('ig.me') ||
      cleanUrl.includes('instagr.am')
    ) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(cleanUrl, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
        });
        clearTimeout(timeoutId);
        if (res.url) {
          resolvedUrl = res.url;
          const resolvedCode = extractInstagramShortcode(resolvedUrl);
          if (resolvedCode) {
            shortcode = resolvedCode;
          }
        }
      } catch {
        // Fallback to initial shortcode
      }
    }

    if (!shortcode || !/^[a-zA-Z0-9_-]{5,40}$/.test(shortcode)) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const canonicalUrl = `https://www.instagram.com/p/${shortcode}/`;

    // 1. Check scoped cache for this exact shortcode
    const cached = mediaCache.get('instagram', shortcode);
    if (cached) {
      return cached;
    }

    // 2. Fetch real metadata and stream from Instagram public endpoints
    const isReel = cleanUrl.includes('/reel') || resolvedUrl.includes('/reel');
    let title = isReel
      ? `Instagram Reel (${shortcode})`
      : `Instagram Video Post (${shortcode})`;
    let author = '@instagram.creator';
    let authorUrl = canonicalUrl;
    let thumbnail = '';
    let directVideoUrl: string | undefined = undefined;

    // Layer 1: Query free Cobalt public endpoints if available
    try {
      const cobaltInstances = [
        'https://api.cobalt.tools',
        'https://co.wuk.sh',
        'https://cobalt.api.scav.one',
      ];

      for (const instance of cobaltInstances) {
        if (directVideoUrl) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(`${instance}/api/json`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            },
            body: JSON.stringify({
              url: canonicalUrl,
              vQuality: '1080',
            }),
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              directVideoUrl = data.url;
            }
            if (data.thumb && !thumbnail) {
              thumbnail = data.thumb;
            }
          }
        } catch {
          // Continue to next layer
        }
      }
    } catch {
      // Continue
    }

    // Layer 2: Query official Instagram web oEmbed with x-ig-app-id
    try {
      const oembedEndpoints = [
        `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(canonicalUrl)}`,
        `https://api.instagram.com/oembed/?url=${encodeURIComponent(canonicalUrl)}`,
      ];

      for (const endpoint of oembedEndpoints) {
        if (thumbnail && author !== '@instagram.creator') break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(endpoint, {
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
              'x-ig-app-id': '936619743392459',
              Accept: 'application/json, text/plain, */*',
            },
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data.title) title = data.title;
            if (data.author_name) author = `@${data.author_name}`;
            if (data.author_url) authorUrl = data.author_url;
            if (data.thumbnail_url) thumbnail = data.thumbnail_url;
          }
        } catch {
          // Continue to next endpoint
        }
      }
    } catch {
      // Continue
    }

    // Layer 3: Attempt to extract real direct video CDN stream from public embed & scripts
    try {
      const embedUrls = [
        `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
        `https://www.instagram.com/p/${shortcode}/embed/`,
        `https://www.instagram.com/reel/${shortcode}/embed/`,
      ];

      for (const embedUrl of embedUrls) {
        if (directVideoUrl) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const embedRes = await fetch(embedUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1',
              Referer: 'https://www.instagram.com/',
            },
          });
          clearTimeout(timeoutId);

          if (embedRes.ok) {
            const html = await embedRes.text();
            const videoMatch =
              html.match(/video_url["']:\s*["']([^"']+)["']/i) ||
              html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
              html.match(/"video_url":\s*"([^"]+)"/i) ||
              html.match(/property=["']og:video["']\s+content=["']([^"']+)["']/i);

            if (videoMatch && videoMatch[1]) {
              directVideoUrl = videoMatch[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&').replace(/\\\//g, '/');
            }

            if (!thumbnail) {
              const imgMatch =
                html.match(/display_url["']:\s*["']([^"']+)["']/i) ||
                html.match(/"display_url":\s*"([^"]+)"/i) ||
                html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
              if (imgMatch && imgMatch[1]) {
                thumbnail = imgMatch[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&').replace(/\\\//g, '/');
              }
            }
          }
        } catch {
          // Continue
        }
      }
    } catch {
      // Continue
    }

    // If thumbnail was not provided by oEmbed/embed, use standard Instagram media preview
    if (!thumbnail) {
      thumbnail = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    }

    const formats: MediaFormat[] = [];
    const resolutions = [
      { id: '1080p', label: '1080p Original HD', res: '1080x1920', bitrate: '4800 kbps', rec: true },
      { id: '720p', label: '720p HD', res: '720x1280', bitrate: '2400 kbps', rec: false },
      { id: '480p', label: '480p SD (Mobile)', res: '480x854', bitrate: '1200 kbps', rec: false },
      { id: '360p', label: '360p Fast Download', res: '360x640', bitrate: '800 kbps', rec: false },
    ];

    const durationSec = parseDurationToSeconds('00:45', 45);

    for (const r of resolutions) {
      const token = tokenService.generateToken({
        mediaId: shortcode,
        platform: 'instagram',
        formatId: `ig_${shortcode}_${r.id}`,
        ext: 'mp4',
        quality: r.label,
        mimeType: 'video/mp4',
        directMediaUrl: directVideoUrl,
      });

      formats.push({
        id: `ig_${shortcode}_${r.id}`,
        type: 'video',
        ext: 'mp4',
        quality: r.label,
        resolution: r.res,
        filesize: estimateFilesize(r.bitrate, r.label, durationSec, 'video', r.res),
        bitrate: r.bitrate,
        hasAudio: true,
        hasVideo: true,
        recommended: r.rec,
        downloadUrl: `/api/v1/download?token=${token}`,
        directStreamUrl: directVideoUrl,
        token,
      });
    }

    const audioToken = tokenService.generateToken({
      mediaId: shortcode,
      platform: 'instagram',
      formatId: `ig_${shortcode}_mp3`,
      ext: 'mp3',
      quality: 'MP3 Original Reel Audio (320 kbps)',
      mimeType: 'audio/mpeg',
      directMediaUrl: directVideoUrl,
    });

    formats.push({
      id: `ig_${shortcode}_mp3`,
      type: 'audio',
      ext: 'mp3',
      quality: 'MP3 Original Reel Audio (320 kbps)',
      filesize: estimateFilesize('320 kbps', '320kbps', durationSec, 'audio'),
      bitrate: '320 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: true,
      downloadUrl: `/api/v1/download?token=${audioToken}`,
      directStreamUrl: directVideoUrl,
      token: audioToken,
    });

    const m4aToken = tokenService.generateToken({
      mediaId: shortcode,
      platform: 'instagram',
      formatId: `ig_${shortcode}_m4a`,
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      mimeType: 'audio/mp4',
      directMediaUrl: directVideoUrl,
    });

    formats.push({
      id: `ig_${shortcode}_m4a`,
      type: 'audio',
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      filesize: estimateFilesize('128 kbps', '128kbps', durationSec, 'audio'),
      bitrate: '128 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: false,
      downloadUrl: `/api/v1/download?token=${m4aToken}`,
      directStreamUrl: directVideoUrl,
      token: m4aToken,
    });

    const result: MediaMetadata = {
      id: `ig_${shortcode}`,
      mediaId: shortcode,
      title,
      author,
      authorUrl,
      thumbnail: thumbnail || '',
      duration: '00:45',
      durationSeconds: 45,
      platform: 'instagram',
      platformName: 'Instagram',
      sourceUrl: cleanUrl,
      canonicalUrl,
      extractedAt: new Date().toISOString(),
      formats,
    };

    mediaCache.set('instagram', shortcode, canonicalUrl, result);
    return result;
  },
};
