import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analytics-service';

export async function GET() {
  const stats = analyticsService.getSystemStats();

  return NextResponse.json({
    success: true,
    data: {
      totalDownloads: stats.totalDownloads,
      todayDownloads: stats.todayDownloads,
      successRate: stats.successRate,
      activeExtractors: stats.activeExtractors,
      platformBreakdown: stats.platformBreakdown,
    },
  });
}
