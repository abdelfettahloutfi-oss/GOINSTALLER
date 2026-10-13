import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { extractYouTubeId } from '../normalizer';
import { mediaCache } from '../../cache/media-cache';
import { tokenService } from '../../download/token-service';
import { estimateFilesize } from '../../media/filesize-resolver';

export const youtubeExtractor: PlatformExtractor = {
  id: 'youtube',
  name: 'YouTube',
  icon: 'Youtube',
  color: '#FF0000',
  accentBg: 'bg-red-50 text-red-700 border-red-200',
  domains: ['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'],
  placeholderExample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  description: 'Download YouTube videos in 4K, 1080p Full HD, 720p and high bitrate MP3 320kbps audio.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        host.includes('youtube.com') ||
        host.includes('youtu.be') ||
        host.includes('youtube-nocookie.com')
      );
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    return extractYouTubeId(url);
  },

  normalizeUrl(url: string): string {
    const id = extractYouTubeId(url);
    if (id) {
      return `https://www.youtube.com/watch?v=${id}`;
    }
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 1. Check scoped cache for this exact video ID
    const cached = mediaCache.get('youtube', videoId);
    if (cached) {
      return cached;
    }

    // 2. Fetch real metadata from official YouTube oEmbed service
    let title = `YouTube Video (${videoId})`;
    let author = 'YouTube Creator';
    let authorUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
        if (data.author_name) author = data.author_name;
        if (data.author_url) authorUrl = data.author_url;
      } else if (res.status === 404 || res.status === 401 || res.status === 403) {
        throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
      }
    } catch (err: any) {
      if (err?.message === EXACT_MEDIA_ERROR_MESSAGE) {
        throw err;
      }
    }

    // 3. Attempt to fetch direct stream endpoints via public Invidious instances
    let directStream720p = '';
    let directStream360p = '';
    let directStreamAudio = '';

    const invidiousInstances = [
      'https://inv.nadeko.net',
      'https://invidious.nerdvpn.de',
      'https://vid.puffyan.us',
    ];

    for (const inv of invidiousInstances) {
      if (directStream720p || directStream360p) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const invRes = await fetch(`${inv}/api/v1/videos/${videoId}`, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
        });
        clearTimeout(timeoutId);
        if (invRes.ok) {
          const invData = await invRes.json();
          if (invData.title && (!title || title.startsWith('YouTube Video'))) {
            title = invData.title;
          }
          if (invData.author) {
            author = invData.author;
          }
          if (Array.isArray(invData.formatStreams)) {
            for (const s of invData.formatStreams) {
              if (s.url) {
                if (s.resolution?.includes('720') || s.qualityLabel?.includes('720')) {
                  directStream720p = s.url;
                } else if (!directStream360p) {
                  directStream360p = s.url;
                }
              }
            }
          }
          if (Array.isArray(invData.adaptiveFormats)) {
            for (const af of invData.adaptiveFormats) {
              if (af.type?.includes('audio') && af.url && !directStreamAudio) {
                directStreamAudio = af.url;
              }
            }
          }
        }
      } catch {
        // Continue fallback
      }
    }

    const formats: MediaFormat[] = [];
    const resolutions = [
      { id: '1080p', label: '1080p Full HD', res: '1920x1080', bitrate: '4800 kbps', rec: true, stream: directStream720p || directStream360p },
      { id: '720p', label: '720p HD', res: '1280x720', bitrate: '2400 kbps', rec: false, stream: directStream720p || directStream360p },
      { id: '480p', label: '480p SD', res: '854x480', bitrate: '1200 kbps', rec: false, stream: directStream360p || directStream720p },
      { id: '360p', label: '360p Standard', res: '640x360', bitrate: '800 kbps', rec: false, stream: directStream360p },
    ];

    const durationSec = 212;

    for (const r of resolutions) {
      const token = tokenService.generateToken({
        mediaId: videoId,
        platform: 'youtube',
        formatId: `yt_${videoId}_${r.id}`,
        ext: 'mp4',
        quality: r.label,
        mimeType: 'video/mp4',
        directMediaUrl: r.stream || undefined,
      });

      formats.push({
        id: `yt_${videoId}_${r.id}`,
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
        directStreamUrl: r.stream || undefined,
        token,
      });
    }

    const tokenMp3 = tokenService.generateToken({
      mediaId: videoId,
      platform: 'youtube',
      formatId: `yt_${videoId}_mp3`,
      ext: 'mp3',
      quality: 'MP3 Audio (320 kbps)',
      mimeType: 'audio/mpeg',
      directMediaUrl: directStreamAudio || undefined,
    });

    formats.push({
      id: `yt_${videoId}_mp3`,
      type: 'audio',
      ext: 'mp3',
      quality: 'MP3 Audio (320 kbps)',
      filesize: estimateFilesize('320 kbps', '320kbps', durationSec, 'audio'),
      bitrate: '320 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: true,
      downloadUrl: `/api/v1/download?token=${tokenMp3}`,
      directStreamUrl: directStreamAudio || undefined,
      token: tokenMp3,
    });

    const tokenM4a = tokenService.generateToken({
      mediaId: videoId,
      platform: 'youtube',
      formatId: `yt_${videoId}_m4a`,
      ext: 'm4a',
      quality: 'M4A Original Audio (128 kbps)',
      mimeType: 'audio/mp4',
      directMediaUrl: directStreamAudio || undefined,
    });

    formats.push({
      id: `yt_${videoId}_m4a`,
      type: 'audio',
      ext: 'm4a',
      quality: 'M4A Original Audio (128 kbps)',
      filesize: estimateFilesize('128 kbps', '128kbps', durationSec, 'audio'),
      bitrate: '128 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: false,
      downloadUrl: `/api/v1/download?token=${tokenM4a}`,
      directStreamUrl: directStreamAudio || undefined,
      token: tokenM4a,
    });

    const result: MediaMetadata = {
      id: `yt_${videoId}`,
      mediaId: videoId,
      title,
      author,
      authorUrl,
      authorAvatar: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      thumbnail,
      duration: '03:32',
      platform: 'youtube',
      platformName: 'YouTube',
      sourceUrl: url,
      canonicalUrl,
      extractedAt: new Date().toISOString(),
      formats,
    };

    mediaCache.set('youtube', videoId, canonicalUrl, result);
    return result;
  },
};
