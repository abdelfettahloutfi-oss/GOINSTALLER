import { NextRequest, NextResponse } from 'next/server';
import { downloadService } from '@/services/download/download-service';
import { tokenService, DownloadTokenPayload } from '@/services/download/token-service';
import { rateLimiter } from '@/services/rate-limit/rate-limiter';
import { mediaCache } from '@/services/cache/media-cache';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get('token');
  const id = searchParams.get('id') || 'media';
  const format = searchParams.get('format') || 'mp4';
  const platform = searchParams.get('platform') || 'video';
  const res = searchParams.get('res') || '1080';
  const bitrate = searchParams.get('bitrate') || '320';
  const mode = searchParams.get('mode'); // 'redirect' | 'stream'

  const clientIp = rateLimiter.getClientIp(req.headers);
  const ipHash = clientIp.replace(/\.\d+$/, '.***');

  const isAudio = format === 'mp3' || format === 'm4a' || format === 'wav' || format === 'aac';

  try {
    // Case 1: Token-based verified stream request
    if (token) {
      const verified = tokenService.verifyToken(token);
      const payload: DownloadTokenPayload | null = verified.valid ? verified.payload || null : null;
      if (!payload) return NextResponse.json({ success: false, error: 'Invalid or expired download token.' }, { status: 401 });

      if (payload) {
        return await downloadService.streamMediaResponse(req, payload, ipHash);
      }
    }

    // Case 2: Direct media ID + platform request
    const cached = mediaCache.get(platform as any, id);
    if (cached && cached.formats && cached.formats.length > 0) {
      const matchedFormat = cached.formats.find((f) =>
        f.ext === format && (isAudio
          ? (f.bitrate?.includes(bitrate) || f.quality?.includes(bitrate))
          : (f.resolution?.includes(res) || f.quality?.includes(res)))
      );
      if (!matchedFormat) return NextResponse.json({ success: false, error: 'Requested format or quality is unavailable.' }, { status: 422 });

      const directUrl = (matchedFormat as any)?.directStreamUrl || (matchedFormat as any)?.streamUrl;
      const payload: DownloadTokenPayload = {
        mediaId: id,
        platform,
        formatId: matchedFormat.id,
        ext: format,
        quality: matchedFormat.quality || `${res}p`,
        mimeType: matchedFormat.type === 'audio' ? 'audio/mpeg' : 'video/mp4',
        directMediaUrl: directUrl,
        expiresAt: Date.now() + 7200 * 1000,
      };

      return await downloadService.streamMediaResponse(req, payload, ipHash);
    }

    return NextResponse.json({ success: false, error: 'Media link expired or media was not found. Please resolve the URL again.' }, { status: 404 });
  } catch (error) {
    console.error('[DOWNLOAD_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Download failed. Please retry.' }, { status: 502 });
  }
}
