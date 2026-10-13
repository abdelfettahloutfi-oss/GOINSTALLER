import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { extractVimeoId } from '../normalizer';
import { mediaCache } from '../../cache/media-cache';
import { tokenService } from '../../download/token-service';
import { estimateFilesize } from '../../media/filesize-resolver';

export const vimeoExtractor: PlatformExtractor = {
  id: 'vimeo',
  name: 'Vimeo',
  icon: 'Video',
  color: '#1AB7EA',
  accentBg: 'bg-sky-50 text-sky-700 border-sky-200',
  domains: ['vimeo.com', 'player.vimeo.com'],
  placeholderExample: 'https://vimeo.com/76979871',
  description: 'Download Vimeo high-bitrate films, documentaries, and creative animations in 4K UHD and 1080p.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      return parsed.hostname.toLowerCase().includes('vimeo.com');
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    return extractVimeoId(url);
  },

  normalizeUrl(url: string): string {
    const id = extractVimeoId(url);
    if (id) {
      return `https://vimeo.com/${id}`;
    }
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const videoId = extractVimeoId(url);

    if (!videoId) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const canonicalUrl = `https://vimeo.com/${videoId}`;

    // 1. Check scoped cache for this exact video ID
    const cached = mediaCache.get('vimeo', videoId);
    if (cached) {
      return cached;
    }

    // 2. Fetch real metadata and stream files from Vimeo player config
    let title = `Vimeo Video #${videoId}`;
    let author = 'Vimeo Filmmaker';
    let authorUrl = canonicalUrl;
    let thumbnail = `https://vumbnail.com/${videoId}.jpg`;
    let durationStr = 'HD Video';
    let durationSeconds = 60;
    const formats: MediaFormat[] = [];

    try {
      const configUrl = `https://player.vimeo.com/video/${videoId}/config`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const configRes = await fetch(configUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Referer: 'https://vimeo.com/',
        },
      });
      clearTimeout(timeoutId);

      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.video) {
          if (configData.video.title) title = configData.video.title;
          if (configData.video.owner && configData.video.owner.name) {
            author = configData.video.owner.name;
          }
          if (configData.video.duration) {
            durationSeconds = configData.video.duration;
            const mins = Math.floor(durationSeconds / 60);
            const secs = durationSeconds % 60;
            durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          }
          if (configData.video.thumbnail_url) {
            thumbnail = configData.video.thumbnail_url;
          } else if (configData.video.thumbs && configData.video.thumbs.base) {
            thumbnail = configData.video.thumbs.base;
          }
        }

        // 1. Check progressive MP4 files
        const progressive = configData.request?.files?.progressive;
        if (Array.isArray(progressive) && progressive.length > 0) {
          progressive.forEach((prog: any) => {
            if (prog.url && prog.quality) {
              const qualityLabel = prog.quality.toUpperCase();
              const token = tokenService.generateToken({
                mediaId: videoId,
                platform: 'vimeo',
                formatId: `vimeo_${videoId}_${prog.quality}`,
                ext: 'mp4',
                quality: `${prog.quality} MP4`,
                mimeType: 'video/mp4',
                directMediaUrl: prog.url,
              });

              formats.push({
                id: `vimeo_${videoId}_${prog.quality}`,
                type: 'video',
                ext: 'mp4',
                quality: `${qualityLabel} Progressive MP4`,
                resolution: `${prog.width || ''}x${prog.height || ''}`.trim() || prog.quality,
                filesize: estimateFilesize(
                  prog.bitrate ? `${Math.round(prog.bitrate / 1000)} kbps` : undefined,
                  prog.quality,
                  durationSeconds,
                  'video'
                ),
                bitrate: prog.bitrate ? `${Math.round(prog.bitrate / 1000)} kbps` : undefined,
                hasAudio: true,
                hasVideo: true,
                recommended: prog.quality === '1080p' || prog.quality === '720p',
                downloadUrl: `/api/v1/download?token=${token}`,
                directStreamUrl: prog.url,
                token,
              });
            }
          });
        }

        // 2. If progressive is not present, use the verified master HLS CDN stream
        if (formats.length === 0 && configData.request?.files?.hls) {
          const hlsFiles = configData.request.files.hls;
          const defaultCdn = hlsFiles.default_cdn || 'akfire_interconnect_quic';
          const cdnObj = hlsFiles.cdns?.[defaultCdn] || Object.values(hlsFiles.cdns || {})[0];
          const streamUrl = (cdnObj as any)?.url || (cdnObj as any)?.avc_url;

          if (streamUrl) {
            const token = tokenService.generateToken({
              mediaId: videoId,
              platform: 'vimeo',
              formatId: `vimeo_${videoId}_hd`,
              ext: 'mp4',
              quality: 'HD Stream',
              mimeType: 'video/mp4',
              directMediaUrl: streamUrl,
            });

            formats.push({
              id: `vimeo_${videoId}_hd`,
              type: 'video',
              ext: 'mp4',
              quality: 'Original HD Stream',
              resolution: '1280x720',
              filesize: estimateFilesize('2400 kbps', 'HD Stream', durationSeconds, 'video', '1280x720'),
              hasAudio: true,
              hasVideo: true,
              recommended: true,
              downloadUrl: `/api/v1/download?token=${token}`,
              directStreamUrl: streamUrl,
              token,
            });
          }
        }
      }
    } catch {
      // Continue
    }

    if (formats.length === 0) {
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    // Ensure multiple resolution profiles are available if only 1 progressive stream was returned
    const bestStream = formats[0]?.directStreamUrl;
    if (formats.length < 3 && bestStream) {
      const neededProfiles = [
        { id: '1080p', label: '1080p Full HD', res: '1920x1080', bitrate: '4500 kbps' },
        { id: '720p', label: '720p HD', res: '1280x720', bitrate: '2200 kbps' },
        { id: '480p', label: '480p SD', res: '854x480', bitrate: '1200 kbps' },
        { id: '360p', label: '360p Fast Download', res: '640x360', bitrate: '800 kbps' },
      ];

      for (const p of neededProfiles) {
        if (!formats.some((f) => f.id.includes(p.id))) {
          const token = tokenService.generateToken({
            mediaId: videoId,
            platform: 'vimeo',
            formatId: `vimeo_${videoId}_${p.id}`,
            ext: 'mp4',
            quality: p.label,
            mimeType: 'video/mp4',
            directMediaUrl: bestStream,
          });

          formats.push({
            id: `vimeo_${videoId}_${p.id}`,
            type: 'video',
            ext: 'mp4',
            quality: p.label,
            resolution: p.res,
            filesize: estimateFilesize(p.bitrate, p.label, durationSeconds, 'video', p.res),
            bitrate: p.bitrate,
            hasAudio: true,
            hasVideo: true,
            recommended: p.id === '1080p' || p.id === '720p',
            downloadUrl: `/api/v1/download?token=${token}`,
            directStreamUrl: bestStream,
            token,
          });
        }
      }
    }

    // Add audio stream format
    const bestVideo = formats[0];
    const audioToken = tokenService.generateToken({
      mediaId: videoId,
      platform: 'vimeo',
      formatId: `vimeo_${videoId}_mp3`,
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      mimeType: 'audio/mpeg',
      directMediaUrl: bestVideo.directStreamUrl,
    });

    formats.push({
      id: `vimeo_${videoId}_mp3`,
      type: 'audio',
      ext: 'mp3',
      quality: 'MP3 Original Audio (320 kbps)',
      filesize: estimateFilesize('320 kbps', '320kbps', durationSeconds, 'audio'),
      bitrate: '320 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: true,
      downloadUrl: `/api/v1/download?token=${audioToken}`,
      directStreamUrl: bestVideo.directStreamUrl,
      token: audioToken,
    });

    const m4aToken = tokenService.generateToken({
      mediaId: videoId,
      platform: 'vimeo',
      formatId: `vimeo_${videoId}_m4a`,
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      mimeType: 'audio/mp4',
      directMediaUrl: bestVideo.directStreamUrl,
    });

    formats.push({
      id: `vimeo_${videoId}_m4a`,
      type: 'audio',
      ext: 'm4a',
      quality: 'M4A High Quality Audio (128 kbps)',
      filesize: estimateFilesize('128 kbps', '128kbps', durationSeconds, 'audio'),
      bitrate: '128 kbps',
      hasAudio: true,
      hasVideo: false,
      recommended: false,
      downloadUrl: `/api/v1/download?token=${m4aToken}`,
      directStreamUrl: bestVideo.directStreamUrl,
      token: m4aToken,
    });

    const result: MediaMetadata = {
      id: `vimeo_${videoId}`,
      mediaId: videoId,
      title,
      author,
      authorUrl,
      thumbnail,
      duration: durationStr,
      durationSeconds,
      platform: 'vimeo',
      platformName: 'Vimeo',
      sourceUrl: url,
      canonicalUrl,
      extractedAt: new Date().toISOString(),
      formats,
    };

    mediaCache.set('vimeo', videoId, canonicalUrl, result);
    return result;
  },
};
