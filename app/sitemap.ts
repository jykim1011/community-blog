import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { crawlers } from '@/lib/crawlers';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteNames = Object.keys(crawlers);

  const sitePages: MetadataRoute.Sitemap = siteNames.map((name) => ({
    url: `${SITE_URL}/site/${name}`,
    changeFrequency: 'always',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: 'always',
      priority: 1,
    },
    ...sitePages,
  ];
}
