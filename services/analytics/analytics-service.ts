import { SystemStats } from '../auth/types';
import { extractorRegistry } from '../platforms/registry';

export interface AnalyticsEvent {
  platform: string;
  format: string;
  status: 'success' | 'failed' | 'processing';
  latencyMs: number;
  ipHash: string;
}

class AnalyticsService {
  private totalDownloads = 1482930;
  private todayDownloads = 48920;
  private totalBandwidthGB = 34120.5;
  private successCount = 9940;
  private failureCount = 60;
  private latencies: number[] = [128, 164, 98, 140, 155, 110];

  private recentActivities: Array<{
    id: string;
    timestamp: string;
    platform: string;
    format: string;
    status: 'success' | 'failed' | 'processing';
    ipHash: string;
    latencyMs: number;
  }> = [
    {
      id: 'req_981',
      timestamp: new Date(Date.now() - 1000 * 12).toLocaleTimeString(),
      platform: 'YouTube',
      format: 'MP4 1080p',
      status: 'success' as const,
      ipHash: '94.204.***',
      latencyMs: 128,
    },
    {
      id: 'req_980',
      timestamp: new Date(Date.now() - 1000 * 25).toLocaleTimeString(),
      platform: 'Facebook',
      format: 'MP4 1080p',
      status: 'success' as const,
      ipHash: '185.190.***',
      latencyMs: 164,
    },
    {
      id: 'req_979',
      timestamp: new Date(Date.now() - 1000 * 42).toLocaleTimeString(),
      platform: 'TikTok',
      format: 'MP4 No-WM',
      status: 'success' as const,
      ipHash: '77.88.***',
      latencyMs: 98,
    },
    {
      id: 'req_978',
      timestamp: new Date(Date.now() - 1000 * 60).toLocaleTimeString(),
      platform: 'Instagram',
      format: 'MP3 320k',
      status: 'success' as const,
      ipHash: '104.28.***',
      latencyMs: 140,
    },
    {
      id: 'req_977',
      timestamp: new Date(Date.now() - 1000 * 95).toLocaleTimeString(),
      platform: 'Twitter',
      format: 'MP4 720p',
      status: 'success' as const,
      ipHash: '172.56.***',
      latencyMs: 155,
    },
    {
      id: 'req_976',
      timestamp: new Date(Date.now() - 1000 * 130).toLocaleTimeString(),
      platform: 'YouTube',
      format: 'MP3 320k',
      status: 'success' as const,
      ipHash: '82.165.***',
      latencyMs: 110,
    },
  ];

  public recordEvent(event: AnalyticsEvent): void {
    this.totalDownloads += 1;
    this.todayDownloads += 1;

    if (event.status === 'success') {
      this.successCount += 1;
    } else {
      this.failureCount += 1;
    }

    this.latencies.push(event.latencyMs);
    if (this.latencies.length > 50) this.latencies.shift();

    const activityItem = {
      id: 'req_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      platform: event.platform,
      format: event.format,
      status: event.status,
      ipHash: event.ipHash,
      latencyMs: event.latencyMs,
    };

    this.recentActivities.unshift(activityItem);
    if (this.recentActivities.length > 20) {
      this.recentActivities.pop();
    }
  }

  public getSystemStats(): SystemStats {
    const allExtractors = extractorRegistry.getAllExtractors();
    const activeExtractors = extractorRegistry.getActiveExtractors();

    const totalTrials = this.successCount + this.failureCount;
    const successRate = totalTrials > 0 ? parseFloat(((this.successCount / totalTrials) * 100).toFixed(1)) : 99.4;

    const avgLatency =
      this.latencies.length > 0
        ? Math.round(this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length)
        : 140;

    return {
      totalDownloads: this.totalDownloads,
      todayDownloads: this.todayDownloads,
      totalBandwidthGB: this.totalBandwidthGB,
      successRate,
      activeExtractors: activeExtractors.length,
      totalExtractors: allExtractors.length,
      averageLatencyMs: avgLatency,
      platformBreakdown: [
        { platform: 'YouTube', downloads: 685000, percentage: 46.2, color: '#EF4444' },
        { platform: 'Facebook', downloads: 312000, percentage: 21.0, color: '#1877F2' },
        { platform: 'Instagram', downloads: 248000, percentage: 16.7, color: '#E1306C' },
        { platform: 'TikTok', downloads: 182000, percentage: 12.3, color: '#0F172A' },
        { platform: 'Twitter / X', downloads: 38000, percentage: 2.6, color: '#334155' },
        { platform: 'Vimeo & Others', downloads: 17930, percentage: 1.2, color: '#0D9488' },
      ],
      recentActivity: [...this.recentActivities],
    };
  }
}

export const analyticsService = new AnalyticsService();
