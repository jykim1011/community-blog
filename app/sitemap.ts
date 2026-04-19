import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { crawlers } from '@/lib/crawlers';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // 커뮤니티 상세 페이지 (색인 허용으로 변경)
  const sitePages = Object.keys(crawlers).map((siteName) => ({
    url: `${SITE_URL}/site/${siteName}`,
    changeFrequency: 'always' as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: 'always',
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
      url: `${SITE_URL}/search`,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/settings`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/hot`,
      changeFrequency: 'always',
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
