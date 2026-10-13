/**
 * SSRF and Upstream Host Validation Service
 * Protects against internal network scanning and unauthorized proxy targets.
 */

const ALLOWED_MEDIA_HOST_PATTERNS: RegExp[] = [
  // YouTube & Google Video
  /^[a-zA-Z0-9.-]+\.googlevideo\.com$/,
  /^[a-zA-Z0-9.-]+\.youtube\.com$/,
  /^[a-zA-Z0-9.-]+\.ytimg\.com$/,
  /^[a-zA-Z0-9.-]+\.youtu\.be$/,

  // Instagram & Facebook / Meta CDN & Threads
  /^[a-zA-Z0-9.-]+\.cdninstagram\.com$/,
  /^[a-zA-Z0-9.-]+\.fbcdn\.net$/,
  /^[a-zA-Z0-9.-]+\.instagram\.com$/,
  /^[a-zA-Z0-9.-]+\.facebook\.com$/,
  /^[a-zA-Z0-9.-]+\.threads\.net$/,

  // TikTok & ByteDance CDN
  /^[a-zA-Z0-9.-]+\.tiktokcdn\.com$/,
  /^[a-zA-Z0-9.-]+\.tiktokcdn-[a-zA-Z0-9.-]+\.com$/,
  /^[a-zA-Z0-9.-]+\.tiktokcdn-us\.com$/,
  /^[a-zA-Z0-9.-]+\.tiktokv\.com$/,
  /^[a-zA-Z0-9.-]+\.tikwm\.com$/,
  /^[a-zA-Z0-9.-]+\.douyincdn\.com$/,
  /^[a-zA-Z0-9.-]+\.muscdn\.com$/,
  /^[a-zA-Z0-9.-]+\.byteoversea\.com$/,
  /^[a-zA-Z0-9.-]+\.ibytedtos\.com$/,
  /^[a-zA-Z0-9.-]+\.byteimg\.com$/,
  /^[a-zA-Z0-9.-]+\.tiktok\.com$/,

  // Vimeo & Akamai / CloudFront CDN
  /^[a-zA-Z0-9.-]+\.vimeocdn\.com$/,
  /^[a-zA-Z0-9.-]+\.vimeo\.com$/,
  /^[a-zA-Z0-9.-]+\.akamaized\.net$/,
  /^[a-zA-Z0-9.-]+\.akamaihd\.net$/,
  /^[a-zA-Z0-9.-]+\.cloudfront\.net$/,
  /^[a-zA-Z0-9.-]+\.fastly\.net$/,

  // Twitter / X
  /^[a-zA-Z0-9.-]+\.twimg\.com$/,
  /^[a-zA-Z0-9.-]+\.twitter\.com$/,
  /^[a-zA-Z0-9.-]+\.x\.com$/,
  /^[a-zA-Z0-9.-]+\.vxtwitter\.com$/,
  /^[a-zA-Z0-9.-]+\.fxtwitter\.com$/,

  // Pinterest
  /^[a-zA-Z0-9.-]+\.pinimg\.com$/,
  /^[a-zA-Z0-9.-]+\.pinterest\.com$/,

  // Public Verified Media Hosts
  /^[a-zA-Z0-9.-]+\.mozilla\.net$/,
  /^[a-zA-Z0-9.-]+\.w3schools\.com$/,
];

export function isAllowedUpstreamUrl(targetUrl: string): { allowed: boolean; reason?: string } {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { allowed: false, reason: 'Empty or invalid URL' };
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl.trim());
  } catch {
    return { allowed: false, reason: 'Malformed URL format' };
  }

  // Only allow HTTP/HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { allowed: false, reason: 'Unsupported protocol' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block loopback, local, and private IPv4 / IPv6 addresses
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('169.254.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { allowed: false, reason: 'Target hostname is a private or loopback address' };
  }

  // Verify against allowed host patterns
  const matchesPattern = ALLOWED_MEDIA_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
  if (!matchesPattern) {
    return { allowed: false, reason: `Host ${hostname} is not in the verified platform media allowlist` };
  }

  return { allowed: true };
}
