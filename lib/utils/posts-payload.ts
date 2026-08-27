import { siteConfigs, type SiteCategory } from '@/lib/constants';
import type { StaticPost } from '@/lib/types';

/** scripts/prepare-data.ts 가 생성하는 컬럼형 페이로드 */
export interface PostsPayload {
  v: number;
  generatedAt: string;
  sites: string[];
  rows: [string, string, string, string, number, number, number, number, number, string][];
}

export const POSTS_PAYLOAD_URL = '/data/posts.json';

/** 압축 페이로드 → StaticPost[] (site 메타는 siteConfigs 에서 복원) */
export function decodePostsPayload(payload: PostsPayload): StaticPost[] {
  const { sites, rows } = payload;

  return rows.map((r) => {
    const site = sites[r[4]] ?? '';
    const config = siteConfigs[site];
    return {
      id: r[0],
      title: r[1],
      author: r[2],
      url: r[3],
      site,
      siteDisplayName: config?.displayName || site,
      siteCategory: (config?.category || 'community') as SiteCategory,
      viewCount: r[5],
      commentCount: r[6],
      likeCount: r[7],
      createdAt: new Date(r[8] * 1000).toISOString(),
      fetchedAt: payload.generatedAt,
      category: r[9] || undefined,
    };
  });
}
