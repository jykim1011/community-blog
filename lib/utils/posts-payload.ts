import { siteConfigs, type SiteCategory } from '@/lib/constants';
import type { StaticPost } from '@/lib/types';

/** scripts/prepare-data.ts 가 생성하는 컬럼형 페이로드 */
export interface PostsPayload {
  v: number;
  generatedAt: string;
  sites: string[];
  // title, author, url, siteIdx, view, comment, like, createdAt(unix 초), category
  rows: [string, string, string, number, number, number, number, number, string][];
}

// v1(posts.json)은 맨 앞에 id 열이 있었다. 캐시된 옛 JS 가 새 형식을 잘못 읽지 않도록 파일명을 바꿨다.
export const POSTS_PAYLOAD_URL = '/data/posts-v2.json';

/** 압축 페이로드 → StaticPost[] (site 메타는 siteConfigs 에서 복원) */
export function decodePostsPayload(payload: PostsPayload): StaticPost[] {
  const { sites, rows } = payload;

  return rows.map((r) => {
    const site = sites[r[3]] ?? '';
    const config = siteConfigs[site];
    return {
      id: r[2],
      title: r[0],
      author: r[1],
      url: r[2],
      site,
      siteDisplayName: config?.displayName || site,
      siteCategory: (config?.category || 'community') as SiteCategory,
      viewCount: r[4],
      commentCount: r[5],
      likeCount: r[6],
      createdAt: new Date(r[7] * 1000).toISOString(),
      fetchedAt: payload.generatedAt,
      category: r[8] || undefined,
    };
  });
}
