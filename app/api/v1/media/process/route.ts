import { NextRequest, NextResponse } from 'next/server';
import { extractorRegistry } from '@/services/platforms/registry';
import { rateLimiter } from '@/services/rate-limit/rate-limiter';
import { analyticsService } from '@/services/analytics/analytics-service';
import { tokenService } from '@/services/download/token-service';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const clientIp = rateLimiter.getClientIp(req.headers);

  // Rate Limiting (30 requests/minute per client IP)
  const rateLimit = rateLimiter.check(`extract_${clientIp}`, { maxRequests: 30, windowMs: 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many download requests. Please wait a moment before trying again.',
        code: 'RATE_LIMITED',
        resetMs: rateLimit.resetMs,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetMs.toString(),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid video or media link.',
          code: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    const inputUrl = url.trim();
    const result = await extractorRegistry.extract(inputUrl);
    const latencyMs = Date.now() - startTime;

    if (!result.success) {
      console.log(`[PIPELINE_TRACE] [${requestId}] EXTRACTION_FAILED:`, {
        requestId,
        inputUrl,
        error: result.error,
        code: result.code,
      });

      analyticsService.recordEvent({
        platform: 'unknown',
        format: 'none',
        status: 'failed',
        latencyMs,
        ipHash: clientIp.replace(/\.\d+$/, '.***'),
      });

      return NextResponse.json(result, { status: 422 });
    }

    const data = result.data!;
    const primaryFormat = data.formats?.[0];
    const decodedToken = primaryFormat?.token
      ? tokenService.decodePayloadWithoutVerification(primaryFormat.token)
      : null;

    // Log full pipeline traceability requirements
    console.log(`[PIPELINE_TRACE] [${requestId}] EXTRACTION_SUCCESS:`, {
      requestId,
      inputUrl,
      detectedPlatform: data.platform,
      canonicalUrl: data.canonicalUrl,
      mediaId: data.mediaId,
      formatId: primaryFormat?.id || 'NONE',
      thumbnail: data.thumbnail || 'NONE',
      directMediaUrl: primaryFormat?.directStreamUrl || decodedToken?.directMediaUrl || 'NONE',
      cacheKey: `${data.platform}_${data.mediaId}`,
      'token.mediaId': decodedToken?.mediaId || 'NONE',
    });

    analyticsService.recordEvent({
      platform: data.platform || 'generic',
      format: primaryFormat?.ext || 'mp4',
      status: 'success',
      latencyMs,
      ipHash: clientIp.replace(/\.\d+$/, '.***'),
    });

    return NextResponse.json({
      ...result,
      meta: {
        requestId,
        latencyMs,
        apiVersion: 'v1',
        cached: false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Server error while processing media request.',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
