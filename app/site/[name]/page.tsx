import type { Metadata } from 'next';
import Link from 'next/link';
import { PostList } from '@/components/post-list';
import { SITE_URL, SITE_NAME, siteConfigs } from '@/lib/constants';
import { crawlers } from '@/lib/crawlers';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const allPosts: StaticPost[] = postsData as StaticPost[];
const allSites: StaticSite[] = sitesData as StaticSite[];

export function generateStaticParams() {
  return Object.keys(crawlers).map((name) => ({ name }));
}

export function generateMetadata({
  params,
}: {
  params: { name: string };
}): Metadata {
  const config = siteConfigs[params.name];
  const displayName = config?.displayName || params.name;

  return {
    title: `${displayName} 인기글`,
    description: `${displayName} 커뮤니티의 인기 게시글을 모아서 보여줍니다.`,
    openGraph: {
      title: `${displayName} 인기글 | ${SITE_NAME}`,
      description: `${displayName} 커뮤니티의 인기 게시글을 모아서 보여줍니다.`,
      url: `${SITE_URL}/site/${params.name}`,
    },
    alternates: {
      canonical: `${SITE_URL}/site/${params.name}`,
    },
  };
}

export default function SitePage({
  params,
}: {
  params: { name: string };
}) {
  const config = siteConfigs[params.name];
  const displayName = config?.displayName || params.name;
  const sitePosts = allPosts.filter((post) => post.site === params.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${displayName} 인기글`,
    description: `${displayName} 커뮤니티의 인기 게시글 모음`,
    url: `${SITE_URL}/site/${params.name}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 헤더 */}
      <header className="bg-gray-50 dark:bg-gray-900 sm:bg-white sm:dark:bg-gray-800 sm:border-b sm:border-gray-200 sm:dark:border-gray-700">
        {/* 모바일: 안전 영역만 */}
        <div className="h-3 sm:hidden" />

        {/* 데스크톱: 뒤로가기 + 타이틀 */}
        <div className="hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                &larr;
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName} 인기글
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <PostList posts={sitePosts} sites={allSites} />
      </main>

      {/* 푸터 */}
      <footer className="mt-8 mb-12 sm:mb-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            통합 커뮤니티 - 모든 게시글은 원본 사이트에 저작권이 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
