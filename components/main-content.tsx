'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostList } from '@/components/post-list';
import { TrendSummary } from '@/components/trend-summary';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import type { StaticPost, StaticSite } from '@/lib/types';

interface MainContentProps {
  initialPosts: StaticPost[];
  initialSites: StaticSite[];
}

export function MainContent({ initialPosts, initialSites }: MainContentProps) {
  const router = useRouter();
  const { subscriptions, isLoaded } = useSubscriptions();
  const [displayPosts, setDisplayPosts] = useState<StaticPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);

  // 선택된 커뮤니티만 필터링
  const filteredSites = subscriptions.length > 0
    ? initialSites.filter(site => subscriptions.includes(site.name))
    : initialSites;

  useEffect(() => {
    if (!isLoaded) return;

    const loadSelectedSites = async () => {
      // 선택된 커뮤니티가 있으면 해당 사이트만 로드
      if (subscriptions.length > 0) {
        setLoading(true);

        try {
          const posts: StaticPost[] = [];

          // 병렬로 선택된 사이트 데이터 로드
          const promises = subscriptions.map(async (siteName) => {
            try {
              // dynamic import로 JSON 파일 로드
              const siteData = await import(`@/data/sites/${siteName}.json`);
              return siteData.default?.posts || siteData.posts || [];
            } catch (err) {
              console.warn(`Failed to load ${siteName}:`, err);
              return [];
            }
          });

          const results = await Promise.all(promises);
          results.forEach((sitePosts) => {
            posts.push(...sitePosts);
          });

          // 시간순 정렬
          posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setDisplayPosts(posts);
        } catch (err) {
          console.error('Failed to load site data:', err);
          setDisplayPosts(initialPosts);
        } finally {
          setLoading(false);
        }
      } else {
        // 선택 없으면 전체 표시
        setDisplayPosts(initialPosts);
      }
    };

    loadSelectedSites();
  }, [subscriptions, isLoaded, initialPosts]);

  const showSettingsBanner = isLoaded && subscriptions.length === 0;

  if (!isLoaded) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-32 sm:pb-4">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-32 sm:pb-4">
      {/* 설정 안내 배너 (커뮤니티 선택 안 했을 때) */}
      {showSettingsBanner && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                💡 원하는 커뮤니티만 선택해서 보세요!
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                현재 모든 커뮤니티가 표시되고 있습니다. 설정에서 원하는 커뮤니티를 선택하면 해당 커뮤니티의 모든 게시글을 볼 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              설정하기
            </button>
          </div>
        </div>
      )}

      {/* 선택된 커뮤니티 표시 */}
      {subscriptions.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">보는 중:</span>
            {subscriptions.slice(0, 5).map((site) => {
              const siteInfo = initialSites.find((s) => s.name === site);
              return (
                <span
                  key={site}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                >
                  {siteInfo?.displayName || site}
                </span>
              );
            })}
            {subscriptions.length > 5 && (
              <span className="text-xs text-gray-500 dark:text-gray-500">
                +{subscriptions.length - 5}개
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            변경
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 게시글 목록 */}
      {!loading && <PostList posts={displayPosts} sites={filteredSites} />}

      {/* 트렌드 분석 */}
      <div className="mt-6">
        <TrendSummary posts={displayPosts} sites={filteredSites} />
      </div>
    </main>
  );
}
