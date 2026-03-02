import { PostList } from '@/components/post-list';
import { AdMobBanner } from '@/components/admob-banner';
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

      {/* 헤더 */}
      <header className="bg-gray-50 dark:bg-gray-900">
        {/* 모바일: 안전 영역만 */}
        <div className="h-3 sm:hidden" />

        {/* 데스크톱: 타이틀 표시 */}
        <div className="hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <a href="/">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {SITE_NAME}
              </h1>
            </a>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <PostList posts={posts} sites={sites} />
      </main>

      {/* 하단 광고 */}
      <AdMobBanner position="bottom" />

      {/* 푸터 */}
      <footer className="mt-8 mb-12 sm:mb-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {SITE_NAME} - 모든 게시글은 원본 사이트에 저작권이 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
