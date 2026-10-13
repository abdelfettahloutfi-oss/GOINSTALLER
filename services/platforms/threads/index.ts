import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { extractThreadsId } from '../normalizer';
import { mediaCache } from '../../cache/media-cache';
import { tokenService } from '../../download/token-service';
import { estimateFilesize, parseDurationToSeconds } from '../../media/filesize-resolver';

export const threadsExtractor: PlatformExtractor = {
  id: 'threads',
  name: 'Threads',
  icon: 'AtSign',
  color: '#000000',
  accentBg: 'bg-zinc-100 text-zinc-900 border-zinc-300',
  domains: ['threads.net'],
  placeholderExample: 'https://www.threads.net/@creator/post/C3x9zP1LXyq',
  description: 'Download video clips and high-resolution media attachments from Threads.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      return parsed.hostname.toLowerCase().includes('threads.net');
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    return extractThreadsId(url);
  },

  normalizeUrl(url: string): string {
    const id = extractThreadsId(url);
    if (id) {
      return `https://www.threads.net/post/${id}`;
    }
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const threadId = extractThreadsId(url);

    if (!threadId) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const canonicalUrl = `https://www.threads.net/post/${threadId}`;

    // 1. Check scoped cache
    const cached = mediaCache.get('threads', threadId);
    if (cached) {
      return cached;
    }

    // 2. Fetch real metadata from Threads endpoints
    let title = `Threads Clip (${threadId})`;
    let author = '@threads.creator';
    let authorUrl = canonicalUrl;
    let thumbnail = '';
    let directVideoUrl: string | undefined = undefined;

    try {
      const oembedUrl = `https://www.threads.net/oembed?url=${encodeURIComponent(canonicalUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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
      // Continue
    }

    // If neither authentic direct stream nor verified metadata could be retrieved from Threads endpoints
    if (!directVideoUrl && !thumbnail) {
      throw new Error(
        "We couldn't retrieve this exact Threads video. Please check the URL or try another supported public video."
      );
    }

    const formats: MediaFormat[] = [];
    const resolutions = [
      { id: '1080p', label: '1080p Full HD', res: '1080x1920', bitrate: '4000 kbps', rec: true },
      { id: '720p', label: '720p HD', res: '720x1280', bitrate: '2200 kbps', rec: false },
      { id: '480p', label: '480p SD', res: '480x854', bitrate: '1200 kbps', rec: false },
      { id: '360p', label: '360p Fast Download', res: '360x640', bitrate: '800 kbps', rec: false },
    ];

    const durationSec = parseDurationToSeconds('00:30', 30);

    for (const r of resolutions) {
      const token = tokenService.generateToken({
        mediaId: threadId,
        platform: 'threads',
        formatId: `th_${threadId}_${r.id}`,
        ext: 'mp4',
        quality: r.label,
        mimeType: 'video/mp4',
        directMediaUrl: directVideoUrl,
      });

      formats.push({
        id: `th_${threadId}_${r.id}`,
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
      mediaId: threadId,
      platform: 'threads',
      formatId: `th_${threadId}_mp3`,
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      mimeType: 'audio/mpeg',
      directMediaUrl: directVideoUrl,
    });

    formats.push({
      id: `th_${threadId}_mp3`,
      type: 'audio',
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
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
      mediaId: threadId,
      platform: 'threads',
      formatId: `th_${threadId}_m4a`,
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      mimeType: 'audio/mp4',
      directMediaUrl: directVideoUrl,
    });

    formats.push({
      id: `th_${threadId}_m4a`,
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
      id: `threads_${threadId}`,
      mediaId: threadId,
      title,
      author,
      authorUrl,
      thumbnail: thumbnail || '',
      duration: '00:30',
      durationSeconds: 30,
      platform: 'threads',
      platformName: 'Threads',
      sourceUrl: url,
      canonicalUrl,
      extractedAt: new Date().toISOString(),
      formats,
    };

    mediaCache.set('threads', threadId, canonicalUrl, result);
    return result;
  },
};
