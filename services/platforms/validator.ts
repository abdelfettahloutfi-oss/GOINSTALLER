import { MediaMetadata } from './types';
import { normalizeAndIdentifyMedia } from './normalizer';
import { tokenService } from '../download/token-service';

export const VALIDATOR_RUNTIME_VERSION = 'FORMAT_DESTINATION_FIX_V2';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  debugInfo?: Record<string, any>;
}

/**
 * Validates that the extracted media metadata strictly belongs to the submitted URL
 * and corresponds to the requested video/media.
 */
export function validateMediaResult(
  submittedUrl: string,
  metadata: MediaMetadata | null | undefined
): ValidationResult {
  console.log('[VALIDATOR RUNTIME VERSION]', VALIDATOR_RUNTIME_VERSION);
  if (!submittedUrl || typeof submittedUrl !== 'string' || !submittedUrl.trim()) {
    return { valid: false, reason: 'Submitted URL is empty.' };
  }

  if (!metadata) {
    return { valid: false, reason: 'Media metadata is null or undefined.' };
  }

  // 1. Normalize the submitted URL to derive the ground-truth expectation
  const expected = normalizeAndIdentifyMedia(submittedUrl);
  console.log('[VALIDATOR] Ground-truth expectation for URL:', submittedUrl, '->', expected);

  if (!expected.isValid && expected.platform !== 'generic') {
    return {
      valid: false,
      reason: `Could not identify a valid ${expected.platform} video identifier from the URL.`,
    };
  }

  // 2. Platform match check
  if (metadata.platform !== expected.platform) {
    return {
      valid: false,
      reason: `Platform mismatch: expected ${expected.platform}, but extractor returned ${metadata.platform}.`,
    };
  }

  // 3. Media ID match check (CRITICAL - exact video identification)
  if (expected.mediaId) {
    const metaId = (metadata.mediaId || metadata.id || '').trim();
    const expId = expected.mediaId.trim();

    // Check direct equality or platform-prefixed equality
    const matchesExact =
      metadata.mediaId === expId ||
      metadata.id === expId ||
      metadata.id === `${expected.platform}_${expId}` ||
      metadata.id === `ig_${expId}` ||
      metadata.id === `tt_${expId}` ||
      metadata.id === `yt_${expId}` ||
      metadata.id === `tw_${expId}` ||
      metadata.id === `fb_${expId}` ||
      metadata.id === `th_${expId}` ||
      metadata.id === `vm_${expId}` ||
      metaId === expId;

    if (!matchesExact) {
      return {
        valid: false,
        reason: `Media ID mismatch: URL requires '${expected.mediaId}', but extractor returned '${metaId}'.`,
      };
    }
  }

  // 4. Formats validation
  if (!Array.isArray(metadata.formats) || metadata.formats.length === 0) {
    return {
      valid: false,
      reason: 'No valid media formats available for download.',
    };
  }

  // Verify format download URLs point strictly to the exact media ID or a valid signed token for this media
  if (expected.mediaId) {
    const expId = expected.mediaId.trim();
    const invalidFormats = metadata.formats.filter((f) => {
      if (!f.downloadUrl) {
        console.warn('[VALIDATOR FORMAT MISMATCH] Format has no downloadUrl:', f.id);
        return true;
      }

      // Check if format has token
      if (f.token) {
        const payload = tokenService.decodePayloadWithoutVerification(f.token);
        console.log('[VALIDATOR FORMAT CHECK]', {
          formatId: f.id,
          expectedMediaId: expId,
          tokenPayloadMediaId: payload?.mediaId,
          tokenPayloadFormatId: payload?.formatId,
          matches: payload?.mediaId === expId,
        });

        if (!payload || payload.mediaId !== expId) {
          console.warn('[VALIDATOR FORMAT MISMATCH] Token mediaId does not match expected mediaId:', {
            formatId: f.id,
            expectedMediaId: expId,
            payloadMediaId: payload?.mediaId,
          });
          return true;
        }
        return false;
      }

      if (
        f.downloadUrl.startsWith('/api/media/download') ||
        f.downloadUrl.startsWith('/api/v1/download')
      ) {
        // Check if downloadUrl contains token query param
        if (f.downloadUrl.includes('token=')) {
          const tokenMatch = f.downloadUrl.match(/token=([^&]+)/);
          if (tokenMatch && tokenMatch[1]) {
            const payload = tokenService.decodePayloadWithoutVerification(tokenMatch[1]);
            if (payload && payload.mediaId === expId) {
              return false;
            }
          }
        }

        const directMatch =
          f.downloadUrl.includes(encodeURIComponent(expId)) ||
          f.downloadUrl.includes(expId);

        if (!directMatch) {
          console.warn('[VALIDATOR FORMAT MISMATCH] Download URL does not reference mediaId or valid token:', f.downloadUrl);
          return true;
        }
        return false;
      }
      return false;
    });

    if (invalidFormats.length > 0) {
      console.warn('[VALIDATOR] Invalid formats found:', invalidFormats);
      return {
        valid: false,
        reason: 'One or more download formats point to a mismatched media destination.',
      };
    }
  }

  // 5. Title sanity check
  if (!metadata.title || typeof metadata.title !== 'string' || metadata.title.trim().length === 0) {
    return {
      valid: false,
      reason: 'Media title is missing or empty.',
    };
  }

  return { valid: true };
}

/**
 * Diagnostic trace log for audit trails and telemetry.
 */
export function logExtractionTrace(details: {
  submittedUrl: string;
  detectedPlatform: string;
  normalizedUrl: string;
  canonicalUrl: string;
  extractedMediaId: string | null;
  extractorUsed: string;
  returnedMediaId: string | null;
  returnedMediaUrl: string;
  validationResult: boolean;
  validationDetails?: string;
}): void {
  const timestamp = new Date().toISOString();
  console.log(
    `[EXTRACTION_TRACE ${timestamp}] Platform: ${details.detectedPlatform} | Expected ID: ${details.extractedMediaId} | Extractor: ${details.extractorUsed} | Result ID: ${details.returnedMediaId} | Valid: ${details.validationResult}`
  );
}
