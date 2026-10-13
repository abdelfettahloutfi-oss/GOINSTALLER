import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { extractTwitterId } from '../normalizer';
import { mediaCache } from '../../cache/media-cache';
import { tokenService } from '../../download/token-service';
import { estimateFilesize, parseDurationToSeconds } from '../../media/filesize-resolver';

export const twitterExtractor: PlatformExtractor = {
  id: 'twitter',
  name: 'X (Twitter)',
  icon: 'Twitter',
  color: '#000000',
  accentBg: 'bg-slate-100 text-slate-800 border-slate-300',
  domains: ['twitter.com', 'x.com', 'mobile.twitter.com'],
  placeholderExample: 'https://x.com/SpaceX/status/1789456123456789012',
  description: 'Download videos and animated GIFs from X (Twitter) in Full HD 1080p, 720p and convert to MP4 or MP3.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return host.includes('twitter.com') || host.includes('x.com');
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    return extractTwitterId(url);
  },

  normalizeUrl(url: string): string {
    const id = extractTwitterId(url);
    if (id) {
      return `https://x.com/i/status/${id}`;
    }
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const tweetId = extractTwitterId(url);

    if (!tweetId) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const canonicalUrl = `https://x.com/i/status/${tweetId}`;

    // 1. Check scoped cache
    const cached = mediaCache.get('twitter', tweetId);
    if (cached) {
      return cached;
    }

    // 2. Fetch real metadata from official Twitter Publish oEmbed
    let title = `X (Twitter) Clip (${tweetId})`;
    let author = 'X User';
    let authorUrl = canonicalUrl;

    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(canonicalUrl)}&omit_script=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.author_name) author = data.author_name;
        if (data.author_url) authorUrl = data.author_url;
        if (data.html) {
          const textMatch = data.html.match(/<p[^>]*>(.*?)<\/p>/);
          if (textMatch && textMatch[1]) {
            const strippedText = textMatch[1].replace(/<[^>]*>/g, '').trim();
            if (strippedText) {
              title = strippedText.length > 80 ? strippedText.slice(0, 77) + '...' : strippedText;
            }
          }
        }
      } else if (res.status === 404 || res.status === 403) {
        throw new Error(
          "We couldn't retrieve this exact X (Twitter) video. Please check the URL or try another supported public video."
        );
      }
    } catch (err: any) {
      if (err?.message?.includes("We couldn't retrieve this exact")) {
        throw err;
      }
    }

    // If Twitter did not return authentic metadata or if tweet is restricted
    if (title.startsWith('X (Twitter) Clip (') && author === 'X User') {
      throw new Error(
        "We couldn't retrieve this exact X (Twitter) video. Please check the URL or try another supported public video."
      );
    }

    const formats: MediaFormat[] = [];
    const resolutions = [
      { id: '1080p', label: '1080p Full HD', res: '1920x1080', bitrate: '4500 kbps', rec: true },
      { id: '720p', label: '720p HD', res: '1280x720', bitrate: '2200 kbps', rec: false },
      { id: '480p', label: '480p SD', res: '854x480', bitrate: '1200 kbps', rec: false },
      { id: '360p', label: '360p Fast Download', res: '640x360', bitrate: '800 kbps', rec: false },
    ];

    const durationSec = parseDurationToSeconds('00:40', 40);

    for (const r of resolutions) {
      const token = tokenService.generateToken({
        mediaId: tweetId,
        platform: 'twitter',
        formatId: `tw_${tweetId}_${r.id}`,
        ext: 'mp4',
        quality: r.label,
        mimeType: 'video/mp4',
      });

      formats.push({
        id: `tw_${tweetId}_${r.id}`,
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
        token,
      });
    }

    const audioToken = tokenService.generateToken({
      mediaId: tweetId,
      platform: 'twitter',
      formatId: `tw_${tweetId}_mp3`,
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      mimeType: 'audio/mpeg',
    });

    formats.push({
      id: `tw_${tweetId}_mp3`,
      type: 'audio',
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      filesize: estimateFilesize('320 kbps', '320kbps', durationSec, 'audio'),
      bitrate: '320 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: true,
      downloadUrl: `/api/v1/download?token=${audioToken}`,
      token: audioToken,
    });

    const m4aToken = tokenService.generateToken({
      mediaId: tweetId,
      platform: 'twitter',
      formatId: `tw_${tweetId}_m4a`,
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      mimeType: 'audio/mp4',
    });

    formats.push({
      id: `tw_${tweetId}_m4a`,
      type: 'audio',
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      filesize: estimateFilesize('128 kbps', '128kbps', durationSec, 'audio'),
      bitrate: '128 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: false,
      downloadUrl: `/api/v1/download?token=${m4aToken}`,
      token: m4aToken,
    });

    const result: MediaMetadata = {
      id: `tw_${tweetId}`,
      mediaId: tweetId,
      title,
      author,
      authorUrl,
      thumbnail: '',
      duration: '00:45',
      durationSeconds: 45,
      platform: 'twitter',
      platformName: 'X (Twitter)',
      sourceUrl: url,
      canonicalUrl,
      extractedAt: new Date().toISOString(),
      formats,
    };

    mediaCache.set('twitter', tweetId, canonicalUrl, result);
    return result;
  },
};
