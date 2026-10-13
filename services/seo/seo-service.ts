import { db } from '@/lib/db/repository';
import { DatabaseToolPage } from '@/lib/db/types';

export interface SeoOverview {
  defaultTitle: string;
  defaultDescription: string;
  siteUrl: string;
  totalPages: number;
  publishedPages: number;
  platforms: string[];
  canonicalBase: string;
}

class SeoService {
  private readonly baseUrl = 'https://www.goinstaller.com';

  public getOverview(): SeoOverview {
    const pages = db.getAllToolPages();
    const published = pages.filter((p) => p.isPublished);
    const platforms = Array.from(new Set(pages.map((p) => p.platform)));

    return {
      defaultTitle: 'Goinstaller – Free Online Video & Audio Downloader',
      defaultDescription: 'Download HD videos and high quality MP3s from YouTube, TikTok, Facebook, Instagram, Vimeo, and X for free.',
      siteUrl: this.baseUrl,
      totalPages: pages.length,
      publishedPages: published.length,
      platforms,
      canonicalBase: this.baseUrl,
    };
  }

  public getAllPages(filters?: { languageCode?: string; platform?: string; isPublished?: boolean; search?: string }): DatabaseToolPage[] {
    return db.getAllToolPages(filters);
  }

  public getPublishedPages(languageCode = 'en'): DatabaseToolPage[] {
    return db.getAllToolPages({ isPublished: true, languageCode });
  }

  public getPageBySlug(slug: string, languageCode?: string): DatabaseToolPage | undefined {
    return db.getToolPageBySlug(slug, languageCode);
  }

  public savePage(pageData: Partial<DatabaseToolPage> & { slug: string; title: string }): DatabaseToolPage {
    return db.saveToolPage(pageData);
  }

  public deletePage(slug: string): boolean {
    return db.deleteToolPage(slug);
  }

  public generateProgrammaticPage(params: {
    platform: string;
    platformName: string;
    toolType: string;
    targetKeyword: string;
    languageCode?: string;
  }): DatabaseToolPage {
    const { platform, platformName, toolType, targetKeyword, languageCode = 'en' } = params;
    const slug = `${platform}-${toolType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+/g, '-');

    return db.saveToolPage({
      slug,
      languageCode,
      platform,
      platformName,
      toolType,
      badge: `${platformName.toUpperCase()} ${toolType.toUpperCase()}`.slice(0, 24),
      targetKeyword,
      searchIntent: `Download and extract ${platformName} ${toolType} quickly in HD`,
      title: `${platformName} ${toolType} – Download ${platformName} Media Online`,
      h1: `${platformName} ${toolType}`,
      tagline: `Fast and free online ${platformName} ${toolType}. Save high definition video streams and audio tracks with zero waiting.`,
      metaDescription: `Best free ${platformName} ${toolType}. Convert and download ${platformName} content in 1080p Full HD, 4K, or 320kbps MP3. Works on iOS, Android, Mac & PC.`,
      primaryFormat: toolType.toLowerCase().includes('mp3') || toolType.toLowerCase().includes('audio') ? 'MP3' : 'MP4',
      keywords: [targetKeyword, `${platform} download`, `${platform} ${toolType}`, `${platform} online downloader`],
      sampleUrl: `https://${platform}.com/video/sample_media_id`,
      canonicalUrl: `https://www.goinstaller.com/${slug}`,
      isPublished: true,
      isIndexable: true,
    });
  }

  public generateJsonLd(page: DatabaseToolPage) {
    const canonical = page.canonicalUrl || `${this.baseUrl}/${page.slug}`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${this.baseUrl}/#website`,
          url: this.baseUrl,
          name: 'Goinstaller',
          description: 'Universal online video downloader and media extractor.',
        },
        {
          '@type': 'WebApplication',
          '@id': `${canonical}#app`,
          url: canonical,
          name: page.h1,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: this.baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: page.h1,
              item: canonical,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: (page.faqs || []).map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };
  }
}

export const seoService = new SeoService();
