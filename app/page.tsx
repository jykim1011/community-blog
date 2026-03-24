import { PostList } from '@/components/post-list';
import { AdMobBanner } from '@/components/admob-banner';
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

      {/* SEO용 독자 콘텐츠 (시각적으로 숨김, 검색엔진용) */}
      <h1 className="sr-only">한국 커뮤니티 인기글 모아보기</h1>
      <p className="sr-only">
        클리앙, 더쿠, 루리웹, 디시인사이드 등 {sites.length}개 커뮤니티의 실시간 인기 게시글을 한곳에서 확인하세요.
        30분마다 자동 업데이트되며, 조회수 · 댓글 · 추천 수 기반으로 화제성 높은 글만 선별합니다.
      </p>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <PostList posts={posts} sites={sites} />
      </main>

      {/* 하단 광고 */}
      <AdMobBanner position="bottom" />

      {/* 푸터 */}
      <SiteFooter />
    </div>
  );
}
