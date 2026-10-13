interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiterService {
  private buckets: Map<string, RateLimitBucket> = new Map();

  // Clean stale IP buckets periodically
  constructor() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.pruneStale(), 5 * 60 * 1000);
    }
  }

  public check(
    key: string,
    config: RateLimitConfig = { maxRequests: 30, windowMs: 60 * 1000 }
  ): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: config.maxRequests - 1, lastRefill: now };
      this.buckets.set(key, bucket);
      return { allowed: true, remaining: config.maxRequests - 1, resetMs: config.windowMs };
    }

    const elapsed = now - bucket.lastRefill;
    if (elapsed > config.windowMs) {
      bucket.tokens = config.maxRequests - 1;
      bucket.lastRefill = now;
      return { allowed: true, remaining: config.maxRequests - 1, resetMs: config.windowMs };
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetMs: config.windowMs - elapsed,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetMs: config.windowMs - elapsed,
    };
  }

  public getClientIp(headers: Headers): string {
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
  }

  private pruneStale(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > 10 * 60 * 1000) {
        this.buckets.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiterService();
