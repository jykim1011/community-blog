import { Feed } from 'feed';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

export const dynamic = 'force-static';

export async function GET() {
  const posts: StaticPost[] = postsData as StaticPost[];
  const sites: StaticSite[] = sitesData as StaticSite[];
  const siteMap = new Map(sites.map((s) => [s.name, s]));

  // RSS 피드 생성
  const feed = new Feed({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    id: SITE_URL,
    link: SITE_URL,
    language: 'ko',
    image: `${SITE_URL}/icon.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,
    updated: new Date(posts[0]?.fetchedAt || new Date()),
    generator: 'Next.js + Feed',
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
      json: `${SITE_URL}/feed.json`,
      atom: `${SITE_URL}/atom.xml`,
    },
    author: {
      name: SITE_NAME,
      link: SITE_URL,
    },
  });

  // 최근 50개 게시글만 포함 (RSS 피드 크기 제한)
  const recentPosts = posts.slice(0, 50);

  for (const post of recentPosts) {
    const site = siteMap.get(post.site);
    const siteName = site?.displayName || post.site;

    feed.addItem({
      title: `[${siteName}] ${post.title}`,
      id: post.id,
      link: post.url,
      description: `${post.title} - ${siteName}에서 인기 게시글`,
      content: `
        <h2>${post.title}</h2>
        <p><strong>커뮤니티:</strong> ${siteName}</p>
        <p><strong>작성자:</strong> ${post.author || '알 수 없음'}</p>
        <p><strong>조회수:</strong> ${post.viewCount?.toLocaleString() || '-'}</p>
        <p><strong>댓글:</strong> ${post.commentCount?.toLocaleString() || '-'}</p>
        <p><strong>좋아요:</strong> ${post.likeCount?.toLocaleString() || '-'}</p>
        <p><a href="${post.url}" target="_blank">원문 보기 →</a></p>
      `,
      author: [
        {
          name: post.author || '알 수 없음',
        },
      ],
      date: new Date(post.createdAt),
      category: [
        {
          name: siteName,
          domain: site?.url || '',
        },
      ],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800', // 30분 캐시
    },
  });
}
