import { MediaMetadata, PlatformExtractor, EXACT_MEDIA_ERROR_MESSAGE, MediaFormat } from '../types';
import { tokenService } from '../../download/token-service';

export const genericExtractor: PlatformExtractor = {
  id: 'generic',
  name: 'Direct Media & Web Links',
  icon: 'Globe',
  color: '#0D9488',
  accentBg: 'bg-teal-50 text-teal-700 border-teal-200',
  domains: ['*'],
  placeholderExample: 'https://example.com/video/sample.mp4',
  description: 'Download direct MP4, WebM, MP3 audio links and supported public media streams.',
  enabled: true,

  matchUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      const pathname = parsed.pathname.toLowerCase();
      return (
        pathname.endsWith('.mp4') ||
        pathname.endsWith('.webm') ||
        pathname.endsWith('.mov') ||
        pathname.endsWith('.mp3') ||
        pathname.endsWith('.m4a') ||
        pathname.endsWith('.wav')
      );
    } catch {
      return false;
    }
  },

  extractId(url: string): string | null {
    try {
      const parsed = new URL(url.trim());
      const filename = parsed.pathname.split('/').filter(Boolean).pop();
      return filename || null;
    } catch {
      return null;
    }
  },

  normalizeUrl(url: string): string {
    return url.trim();
  },

  async extract(url: string): Promise<MediaMetadata> {
    const trimmed = url.trim();
    let filename = '';

    try {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname.toLowerCase();
      const isDirectMedia =
        pathname.endsWith('.mp4') ||
        pathname.endsWith('.webm') ||
        pathname.endsWith('.mov') ||
        pathname.endsWith('.mp3') ||
        pathname.endsWith('.m4a') ||
        pathname.endsWith('.wav');

      if (!isDirectMedia) {
        throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
      }

      const parts = parsed.pathname.split('/').filter(Boolean);
      filename = parts[parts.length - 1] || 'media_file';
    } catch (err: any) {
      if (err?.message === EXACT_MEDIA_ERROR_MESSAGE) throw err;
      throw new Error(EXACT_MEDIA_ERROR_MESSAGE);
    }

    const isAudio = filename.endsWith('.mp3') || filename.endsWith('.m4a') || filename.endsWith('.wav');
    const ext = isAudio ? 'mp3' : 'mp4';

    const token = tokenService.generateToken({
      mediaId: filename,
      platform: 'generic',
      formatId: `gen_${filename}_direct`,
      ext,
      quality: 'Original Stream',
      mimeType: isAudio ? 'audio/mpeg' : 'video/mp4',
      directMediaUrl: trimmed,
    });

    const formats: MediaFormat[] = [
      {
        id: `gen_${filename}_direct`,
        type: isAudio ? 'audio' : 'video',
        ext,
        quality: 'Original Direct Stream',
        resolution: isAudio ? undefined : 'Original',
        filesize: isAudio ? '3.6 MB' : '15.4 MB',
        hasAudio: true,
        hasVideo: !isAudio,
        recommended: true,
        downloadUrl: `/api/v1/download?token=${token}`,
        directStreamUrl: trimmed,
        token,
      },
    ];

    const result: MediaMetadata = {
      id: `generic_${filename}`,
      mediaId: filename,
      title: filename,
      author: 'Direct File Host',
      authorUrl: trimmed,
      thumbnail: '',
      duration: isAudio ? 'Audio Stream' : 'Video Stream',
      platform: 'generic',
      platformName: 'Direct Media',
      sourceUrl: trimmed,
      canonicalUrl: trimmed,
      extractedAt: new Date().toISOString(),
      formats,
    };

    return result;
  },
};
