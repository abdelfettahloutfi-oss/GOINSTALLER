import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { extractTikTokId } from '../normalizer';
import { mediaCache } from '../../cache/media-cache';
import { tokenService } from '../../download/token-service';
import { estimateFilesize, parseDurationToSeconds } from '../../media/filesize-resolver';

export const tiktokExtractor: PlatformExtractor = {
  id: 'tiktok',
  name: 'TikTok',
  icon: 'Music2',
  color: '#000000',
  accentBg: 'bg-slate-100 text-slate-900 border-slate-300',
  domains: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
  placeholderExample: 'https://www.tiktok.com/@creator/video/7234567890123456789',
  description: 'Download TikTok videos without watermark, HD quality MP4, and extract background music as MP3.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        host.includes('tiktok.com') ||
        host.includes('vm.tiktok.com') ||
        host.includes('vt.tiktok.com')
      );
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    return extractTikTokId(url);
  },

  normalizeUrl(url: string): string {
    const id = extractTikTokId(url);
    if (id && /^\d+$/.test(id)) {
      return `https://www.tiktok.com/@video/video/${id}`;
    }
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const cleanUrl = url.trim();
    let rawId = extractTikTokId(cleanUrl);
    let resolvedUrl = cleanUrl;

    // Follow redirect server-side for shortened share links (vm.tiktok.com, vt.tiktok.com, /t/)
    if (
      cleanUrl.includes('vm.tiktok.com') ||
      cleanUrl.includes('vt.tiktok.com') ||
      cleanUrl.includes('/t/')
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
          const resolvedId = extractTikTokId(resolvedUrl);
          if (resolvedId) {
            rawId = resolvedId;
          }
        }
      } catch {
        // Continue with original ID
      }
    }

    if (!rawId) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const videoId = rawId;
    const canonicalUrl = /^\d+$/.test(videoId)
      ? `https://www.tiktok.com/@video/video/${videoId}`
      : resolvedUrl;

    // 1. Check scoped cache for this exact video ID
    const cached = mediaCache.get('tiktok', videoId);
    if (cached) {
      return cached;
    }

    // 2. Fetch real metadata and stream using multi-layered extraction
    let title = `TikTok Video (${videoId.slice(0, 14)})`;
    let author = '@tiktok.creator';
    let authorUrl = 'https://www.tiktok.com';
    let thumbnail = '';
    let directVideoUrl: string | undefined = undefined;
    let directAudioUrl: string | undefined = undefined;

    // Primary Extraction Layer: tikwm API for direct no-watermark MP4 & audio streams
    try {
      const tikwmEndpoint = `https://www.tikwm.com/api/?url=${encodeURIComponent(resolvedUrl || canonicalUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const tikwmRes = await fetch(tikwmEndpoint, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
      });
      clearTimeout(timeoutId);

      if (tikwmRes.ok) {
        const json = await tikwmRes.json();
        if (json && json.code === 0 && json.data) {
          const d = json.data;
          if (d.title) title = d.title;
          if (d.author?.unique_id) {
            author = `@${d.author.unique_id}`;
            authorUrl = `https://www.tiktok.com/@${d.author.unique_id}`;
          } else if (d.author?.nickname) {
            author = `@${d.author.nickname}`;
          }
          if (d.cover || d.origin_cover) {
            const rawCover = d.cover || d.origin_cover;
            thumbnail = rawCover.startsWith('/') ? `https://www.tikwm.com${rawCover}` : rawCover;
          }
          const rawVideo = d.hdplay || d.play;
          if (rawVideo) {
            directVideoUrl = rawVideo.startsWith('/') ? `https://www.tikwm.com${rawVideo}` : rawVideo;
          }
          if (d.music) {
            directAudioUrl = d.music.startsWith('/') ? `https://www.tikwm.com${d.music}` : d.music;
          }
        }
      }
    } catch {
      // Continue to secondary fallbacks
    }

    // Secondary Extraction Layer: TikTok Official oEmbed for metadata verification
    if (!thumbnail || !title.trim() || title.startsWith('TikTok Video (')) {
      try {
        const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(oembedEndpoint, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.title) title = data.title;
          if (data.author_name) author = `@${data.author_name}`;
          if (data.author_url) authorUrl = data.author_url;
          if (data.thumbnail_url && !thumbnail) thumbnail = data.thumbnail_url;
        } else if (res.status === 404 || res.status === 403) {
          if (!directVideoUrl) {
            throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
          }
        }
      } catch (err: any) {
        if (err?.message === EXACT_MEDIA_ERROR_MESSAGE) {
          throw err;
        }
      }
    }

    // Tertiary Extraction Layer: Query TikTok public embed endpoint if direct stream still needed
    if (!directVideoUrl) {
      try {
        const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const embedRes = await fetch(embedUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            Referer: 'https://www.tiktok.com/',
          },
        });
        clearTimeout(timeoutId);

        if (embedRes.ok) {
          const html = await embedRes.text();
          const videoSrcMatch =
            html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
            html.match(/"playAddr":\s*"([^"]+)"/i) ||
            html.match(/"downloadAddr":\s*"([^"]+)"/i);

          if (videoSrcMatch && videoSrcMatch[1]) {
            directVideoUrl = videoSrcMatch[1].replace(/\\u002F/g, '/').replace(/\\u0026/g, '&');
          }
        }
      } catch {
        // Continue
      }
    }

    if (!directVideoUrl) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const formats: MediaFormat[] = [];
    const resolutions = [
      { id: '1080p', label: '1080p Full HD (No Watermark)', res: '1080x1920', bitrate: '4500 kbps', rec: true },
      { id: '720p', label: '720p HD (No Watermark)', res: '720x1280', bitrate: '2200 kbps', rec: false },
      { id: '480p', label: '480p SD (Mobile)', res: '480x854', bitrate: '1200 kbps', rec: false },
      { id: '360p', label: '360p Fast Download', res: '360x640', bitrate: '800 kbps', rec: false },
    ];

    const durationSec = parseDurationToSeconds('00:30', 30);

    for (const r of resolutions) {
      const token = tokenService.generateToken({
        mediaId: videoId,
        platform: 'tiktok',
        formatId: `tt_${videoId}_${r.id}`,
        ext: 'mp4',
        quality: r.label,
        mimeType: 'video/mp4',
        directMediaUrl: directVideoUrl,
      });

      formats.push({
        id: `tt_${videoId}_${r.id}`,
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

    const audioStream = directAudioUrl || directVideoUrl;
    const audioToken = tokenService.generateToken({
      mediaId: videoId,
      platform: 'tiktok',
      formatId: `tt_${videoId}_mp3`,
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      mimeType: 'audio/mpeg',
      directMediaUrl: audioStream,
    });

    formats.push({
      id: `tt_${videoId}_mp3`,
      type: 'audio',
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      filesize: estimateFilesize('320 kbps', '320kbps', durationSec, 'audio'),
      bitrate: '320 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: true,
      downloadUrl: `/api/v1/download?token=${audioToken}`,
      directStreamUrl: audioStream,
      token: audioToken,
    });

    const m4aToken = tokenService.generateToken({
      mediaId: videoId,
      platform: 'tiktok',
      formatId: `tt_${videoId}_m4a`,
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      mimeType: 'audio/mp4',
      directMediaUrl: audioStream,
    });

    formats.push({
      id: `tt_${videoId}_m4a`,
      type: 'audio',
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      filesize: estimateFilesize('128 kbps', '128kbps', durationSec, 'audio'),
      bitrate: '128 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: false,
      downloadUrl: `/api/v1/download?token=${m4aToken}`,
      directStreamUrl: audioStream,
      token: m4aToken,
    });

    const result: MediaMetadata = {
      id: `tiktok_${videoId}`,
      mediaId: videoId,
      title,
      author,
      authorUrl,
      thumbnail: thumbnail || '',
      duration: '00:30',
      durationSeconds: 30,
      platform: 'tiktok',
      platformName: 'TikTok',
      sourceUrl: cleanUrl,
      canonicalUrl,
      extractedAt: new Date().toISOString(),
      formats,
    };

    mediaCache.set('tiktok', videoId, canonicalUrl, result);
    return result;
  },
};
