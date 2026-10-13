import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSiteSettings();
  const monetization = db.getMonetization();

  return NextResponse.json({
    success: true,
    settings: {
      siteName: settings.siteName,
      siteDomain: settings.siteDomain,
      tagline: settings.tagline,
      description: settings.description,
      supportEmail: settings.supportEmail,
      defaultLanguage: settings.defaultLanguage,
      maintenanceMode: settings.maintenanceMode,
      mp3ConversionEnabled: settings.mp3ConversionEnabled,
      highRes4kEnabled: settings.highRes4kEnabled,
      supportedFormats: settings.supportedFormats,
    },
    monetization: {
      adsEnabled: monetization.adsEnabled,
      headerBannerEnabled: monetization.headerBannerEnabled,
      headerBannerCode: monetization.headerBannerCode,
      resultBannerEnabled: monetization.resultBannerEnabled,
      resultBannerCode: monetization.resultBannerCode,
      footerBannerEnabled: monetization.footerBannerEnabled,
      footerBannerCode: monetization.footerBannerCode,
      interstitialEnabled: monetization.interstitialEnabled,
    },
  });
}
