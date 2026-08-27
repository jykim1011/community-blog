import { DashboardHome } from '@/components/dashboard-home';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import initialPostsData from '@/data/posts-initial.json';
import sitesData from '@/data/sites.json';
import analysisData from '@/data/analysis.json';
import type { StaticPost, StaticSite } from '@/lib/types';

// 전체 목록(7000건)을 인라인하면 홈 HTML 이 4MB 가 된다.
// 첫 화면 60건만 SSR 로 내려주고, 나머지는 usePosts 가 마운트 후 가져온다.
const initialPosts: StaticPost[] = initialPostsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

const topKeywords = (analysisData as { keywords: { word: string }[] })
  .keywords.slice(0, 8)
  .map(k => ({ word: k.word }));

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${SITE_NAME} 실시간 인기글`,
  url: SITE_URL,
  numberOfItems: initialPosts.length,
  itemListElement: initialPosts.slice(0, 20).map((post, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: post.title,
    url: post.url,
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DashboardHome initialPosts={initialPosts} initialSites={sites} keywords={topKeywords} />
    </>
  );
}
