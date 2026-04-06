import type { Metadata } from 'next';
import Link from 'next/link';
import { PostList } from '@/components/post-list';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShareButton } from '@/components/share-button';
import { SITE_URL, SITE_NAME, siteConfigs } from '@/lib/constants';
import { crawlers } from '@/lib/crawlers';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import analysisData from '@/data/analysis.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const allPosts: StaticPost[] = postsData as StaticPost[];
const allSites: StaticSite[] = sitesData as StaticSite[];
const analysis = analysisData as {
  communityProfiles: {
    name: string;
    displayName: string;
    description: string;
    category: string;
    primaryTopics: string[];
    postCount: number;
    avgViewCount: number;
    avgCommentCount: number;
    avgLikeCount: number;
    peakHours: number[];
  }[];
};

export function generateStaticParams() {
  return Object.keys(crawlers).map((name) => ({ name }));
}

export function generateMetadata({
  params,
}: {
  params: { name: string };
}): Metadata {
  const config = siteConfigs[params.name];
  const profile = analysis.communityProfiles.find((p) => p.name === params.name);
  const displayName = config?.displayName || params.name;
  const description = profile?.description || `${displayName} 커뮤니티의 인기 게시글을 모아서 보여줍니다.`;

  return {
    title: `${displayName} 인기글 - ${SITE_NAME}`,
    description,
    robots: {
      index: true, // 색인 허용으로 변경
      follow: true,
    },
    openGraph: {
      title: `${displayName} 인기글 | ${SITE_NAME}`,
      description,
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
  const profile = analysis.communityProfiles.find((p) => p.name === params.name);
  const displayName = config?.displayName || params.name;
  const sitePosts = allPosts.filter((post) => post.site === params.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${displayName} 인기글`,
    description: profile?.description || `${displayName} 커뮤니티의 인기 게시글 모음`,
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

      {/* 네비게이션 */}
      <SiteHeader />

      {/* 사이트 헤더 */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-1"
              >
                &larr;
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </h1>
                  {profile && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                      {profile.category}
                    </span>
                  )}
                </div>
                {profile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {profile.description}
                  </p>
                )}
                {config?.url && (
                  <a
                    href={config.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {config.url} →
                  </a>
                )}
              </div>
            </div>
            <ShareButton
              title={`${displayName} 인기글`}
              url={`${SITE_URL}/site/${params.name}`}
            />
          </div>

          {/* 통계 카드 */}
          {profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">게시글</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.postCount}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">평균 조회</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.avgViewCount.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">평균 댓글</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.avgCommentCount}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">평균 좋아요</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.avgLikeCount}
                </div>
              </div>
            </div>
          )}

          {/* 주요 토픽 + 피크 시간대 */}
          {profile && (
            <div className="flex flex-wrap gap-4 text-xs">
              {profile.primaryTopics.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">주요 토픽:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {profile.primaryTopics.join(', ')}
                  </span>
                </div>
              )}
              {profile.peakHours.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">피크 시간대:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {profile.peakHours.map((h) => `${h}시`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <PostList posts={sitePosts} sites={allSites} />
      </main>

      {/* 푸터 */}
      <SiteFooter />
    </div>
  );
}
