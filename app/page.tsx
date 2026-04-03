import { PostList } from '@/components/post-list';
import { TrendSummary } from '@/components/trend-summary';
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

      {/* 히어로 섹션 - 모바일: 컴팩트 1줄, PC: 풀 */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-6">
          {/* 모바일: 한 줄 요약 */}
          <div className="sm:hidden flex items-center justify-between">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              커뮤니티 인기글
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <span>{sites.length}개 사이트</span>
              <span>·</span>
              <span>{posts.length.toLocaleString()}건</span>
            </div>
          </div>

          {/* PC: 풀 히어로 */}
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              한국 커뮤니티 인기글 모아보기
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-4">
              클리앙, 더쿠, 루리웹, 디시인사이드 등 {sites.length}개 커뮤니티의 실시간 인기 게시글을 한곳에서 확인하세요.
              조회수, 댓글, 추천 수를 기반으로 화제성 높은 글만 선별하여 30분마다 자동 업데이트합니다.
            </p>

            {/* 통계 카드 */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{posts.length.toLocaleString()}</span>
                <span className="text-xs text-blue-700 dark:text-blue-300">인기 게시글</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-sm font-semibold">{sites.length}</span>
                <span className="text-xs text-green-700 dark:text-green-300">커뮤니티 수집</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg">
                <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold">30분</span>
                <span className="text-xs text-purple-700 dark:text-purple-300">업데이트 주기</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* 트렌드 분석 - PC에서만 표시 (모바일은 게시글 목록 우선) */}
        <div className="hidden sm:block">
          <TrendSummary posts={posts} sites={sites} />
        </div>

        {/* 게시글 목록 */}
        <PostList posts={posts} sites={sites} />
      </main>

      {/* 하단 광고 */}
      <AdMobBanner position="bottom" />

      {/* 푸터 */}
      <SiteFooter />
    </div>
  );
}
