import type { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { SITE_URL, siteConfigs } from '@/lib/constants';
import { crawlers } from '@/lib/crawlers';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // 커뮤니티 상세 페이지 — 수집 중인 사이트만 (app/site/[name] 의 generateStaticParams 와 같은 기준)
  const sitePages = Object.keys(crawlers)
    .filter((siteName) => siteConfigs[siteName] && !siteConfigs[siteName].disabled)
    .map((siteName) => ({
      url: `${SITE_URL}/site/${siteName}`,
      lastModified: siteLastUpdated(siteName),
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    }));
  const lastModified = sitePages
    .map((p) => p.lastModified)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guide`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/hot`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/trends`,
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/statistics`,
      changeFrequency: 'always',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/keywords`,
      changeFrequency: 'always',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/communities`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...sitePages,
  ];
}

function siteLastUpdated(siteName: string): Date | undefined {
  try {
    const file = path.join(process.cwd(), 'data', 'sites', `${siteName}.json`);
    const { lastUpdated } = JSON.parse(fs.readFileSync(file, 'utf-8')) as { lastUpdated?: string };
    return lastUpdated ? new Date(lastUpdated) : undefined;
  } catch {
    return undefined;
  }
}
