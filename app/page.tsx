import { PostList } from '@/components/post-list';
import { TrendSummary } from '@/components/trend-summary';
import { AdMobBanner } from '@/components/admob-banner';
import { BottomAdContainer } from '@/components/bottom-ad-container';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const posts: StaticPost[] = postsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  inLanguage: 'ko',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 네비게이션 */}
      <SiteHeader />

      {/* 메인 컨텐츠 - 리스트 우선 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-32 sm:pb-4">
        {/* 게시글 목록 - 최상단 배치 */}
        <PostList posts={posts} sites={sites} />

        {/* 트렌드 분석 - 하단에 접을 수 있는 형태로 */}
        <div className="mt-6">
          <TrendSummary posts={posts} sites={sites} />
        </div>
      </main>

      {/* 하단 광고 (앱: AdMob, 웹: AdSense) */}
      <AdMobBanner position="bottom" />
      <BottomAdContainer />

      {/* 푸터 */}
      <SiteFooter />
    </div>
  );
}
