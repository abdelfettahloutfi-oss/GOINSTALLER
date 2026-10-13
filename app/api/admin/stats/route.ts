import { NextRequest, NextResponse } from 'next/server';
import { extractorRegistry } from '@/services/platforms/registry';
import { authService } from '@/services/auth/auth-service';
import { SystemStats } from '@/services/auth/types';

export async function GET(req: NextRequest) {
  // Verify token
  const token =
    req.cookies.get('gis_admin_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');

  const user = token ? await authService.verifySession(token) : null;

  const allExtractors = extractorRegistry.getAllExtractors();
  const activeExtractors = extractorRegistry.getActiveExtractors();

  const stats: SystemStats = {
    totalDownloads: 1482930,
    todayDownloads: 48920,
    totalBandwidthGB: 34120.5,
    successRate: 99.4,
    activeExtractors: activeExtractors.length,
    totalExtractors: allExtractors.length,
    averageLatencyMs: 142,
    platformBreakdown: [
      { platform: 'YouTube', downloads: 685000, percentage: 46.2, color: '#EF4444' },
      { platform: 'Facebook', downloads: 312000, percentage: 21.0, color: '#1877F2' },
      { platform: 'Instagram', downloads: 248000, percentage: 16.7, color: '#E1306C' },
      { platform: 'TikTok', downloads: 182000, percentage: 12.3, color: '#0F172A' },
      { platform: 'Twitter / X', downloads: 38000, percentage: 2.6, color: '#334155' },
      { platform: 'Vimeo & Others', downloads: 17930, percentage: 1.2, color: '#0D9488' },
    ],
    recentActivity: [
      {
        id: 'req_981',
        timestamp: new Date(Date.now() - 1000 * 12).toLocaleTimeString(),
        platform: 'YouTube',
        format: 'MP4 1080p',
        status: 'success',
        ipHash: '94.204.***',
        latencyMs: 128,
      },
      {
        id: 'req_980',
        timestamp: new Date(Date.now() - 1000 * 25).toLocaleTimeString(),
        platform: 'Facebook',
        format: 'MP4 1080p',
        status: 'success',
        ipHash: '185.190.***',
        latencyMs: 164,
      },
      {
        id: 'req_979',
        timestamp: new Date(Date.now() - 1000 * 42).toLocaleTimeString(),
        platform: 'TikTok',
        format: 'MP4 No-WM',
        status: 'success',
        ipHash: '77.88.***',
        latencyMs: 98,
      },
      {
        id: 'req_978',
        timestamp: new Date(Date.now() - 1000 * 60).toLocaleTimeString(),
        platform: 'Instagram',
        format: 'MP3 320k',
        status: 'success',
        ipHash: '104.28.***',
        latencyMs: 140,
      },
      {
        id: 'req_977',
        timestamp: new Date(Date.now() - 1000 * 95).toLocaleTimeString(),
        platform: 'Twitter',
        format: 'MP4 720p',
        status: 'success',
        ipHash: '172.56.***',
        latencyMs: 155,
      },
      {
        id: 'req_976',
        timestamp: new Date(Date.now() - 1000 * 130).toLocaleTimeString(),
        platform: 'YouTube',
        format: 'MP3 320k',
        status: 'success',
        ipHash: '82.165.***',
        latencyMs: 110,
      },
    ],
  };

  return NextResponse.json({
    success: true,
    stats,
    extractors: allExtractors.map((e) => ({
      id: e.id,
      name: e.name,
      domains: e.domains,
      enabled: e.enabled,
      description: e.description,
    })),
  });
}
