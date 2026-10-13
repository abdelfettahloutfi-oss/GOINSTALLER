import crypto from 'crypto';
import { isAllowedUpstreamUrl } from './ssrf-protection';

const SECRET_KEY = process.env.DOWNLOAD_SIGNING_SECRET || 'goinstaller-media-secure-stream-key-2026';

export interface DownloadTokenPayload {
  mediaId: string;
  platform: string;
  formatId: string;
  ext: string;
  quality: string;
  mimeType: string;
  directMediaUrl?: string;
  expiresAt: number; // Unix timestamp in ms
}

class TokenService {
  /**
   * Generates a signed, URL-safe base64 token for downloading a specific media stream (default TTL: 2 hours)
   */
  public generateToken(payload: Omit<DownloadTokenPayload, 'expiresAt'>, ttlSeconds: number = 7200): string {
    const fullPayload: DownloadTokenPayload = {
      ...payload,
      expiresAt: Date.now() + Math.max(ttlSeconds, 1800) * 1000,
    };

    const payloadJson = JSON.stringify(fullPayload);
    let payloadB64: string;
    if (typeof Buffer !== 'undefined') {
      payloadB64 = Buffer.from(payloadJson).toString('base64url');
    } else {
      payloadB64 = btoa(unescape(encodeURIComponent(payloadJson)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    let signature = 'browser_unsigned';
    if (crypto && typeof crypto.createHmac === 'function') {
      signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payloadB64)
        .digest('base64url');
    }

    return `${payloadB64}.${signature}`;
  }

  /**
   * Safely extracts and decodes token payload without requiring server HMAC secret
   * (safe for browser client validation and inspection)
   */
  public decodePayloadWithoutVerification(token: string): DownloadTokenPayload | null {
    try {
      if (!token || typeof token !== 'string') {
        console.warn('[TOKEN DECODE] Token is missing or not a string:', token);
        return null;
      }
      const parts = token.split('.');
      const payloadB64 = parts[0];
      if (!payloadB64) {
        console.warn('[TOKEN DECODE] Token missing payload part:', token);
        return null;
      }

      let jsonStr = '';
      if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
        try {
          jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
        } catch {
          jsonStr = '';
        }
      }
      
      if (!jsonStr) {
        const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : '';
        const binary = atob(base64 + pad);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        jsonStr = new TextDecoder().decode(bytes);
      }

      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (err: any) {
      console.error('[TOKEN DECODE ERROR] Failed to decode token payload:', err?.message, 'Token:', token);
      return null;
    }
  }

  /**
   * Validates and decodes a signed download token on the server
   */
  public verifyToken(token: string): { valid: boolean; payload?: DownloadTokenPayload; error?: string } {
    console.log('[VALIDATION PATH] SERVER CRYPTOGRAPHIC VALIDATION - verifying token signature');
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Download token is missing' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid download token format' };
    }

    const [payloadB64, signature] = parts;
    if (crypto && typeof crypto.createHmac === 'function') {
      const expectedSig = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payloadB64)
        .digest('base64url');

      if (signature !== expectedSig) {
        return { valid: false, error: 'Download token signature verification failed' };
      }
    }

    try {
      const payload = this.decodePayloadWithoutVerification(token);
      if (!payload) {
        return { valid: false, error: 'Malformed token payload' };
      }

      if (Date.now() > payload.expiresAt) {
        return { valid: false, error: 'Download link has expired. Please refresh and request a new download.' };
      }

      // If token contains a direct media URL, validate via SSRF filter
      if (payload.directMediaUrl) {
        const ssrfCheck = isAllowedUpstreamUrl(payload.directMediaUrl);
        if (!ssrfCheck.allowed) {
          return { valid: false, error: `Invalid upstream target: ${ssrfCheck.reason}` };
        }
      }

      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'Malformed token payload' };
    }
  }
}

export const tokenService = new TokenService();
