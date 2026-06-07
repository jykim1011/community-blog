'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import type { StaticPost } from '@/lib/types';
import { PostList } from '@/components/post-list';
import { SiteHeader } from '@/components/site-header';

export default function FeedPage() {
  const router = useRouter();
  const { subscriptions, isLoaded } = useSubscriptions();
  const [allPosts, setAllPosts] = useState<StaticPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    // 구독이 없으면 구독 관리 페이지로 이동
    if (subscriptions.length === 0) {
      router.push('/subscriptions');
      return;
    }

    // 구독한 사이트의 데이터 로드
    const loadFeedData = async () => {
      setLoading(true);
      setError(null);

      try {
        const posts: StaticPost[] = [];

        // 병렬로 모든 구독 사이트 데이터 로드
        const promises = subscriptions.map(async (siteName) => {
          try {
            const response = await fetch(`/data/sites/${siteName}.json`);
            if (response.ok) {
              const data = await response.json();
              return data.posts || [];
            }
            return [];
          } catch (err) {
            console.warn(`Failed to load ${siteName}:`, err);
            return [];
          }
        });

        const results = await Promise.all(promises);
        results.forEach((sitePosts) => {
          posts.push(...sitePosts);
        });

        // 시간순 정렬 (최신순)
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllPosts(posts);
      } catch (err) {
        console.error('Failed to load feed:', err);
        setError('피드를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadFeedData();
  }, [subscriptions, isLoaded, router]);

  // 사이트별 통계
  const stats = useMemo(() => {
    const siteCounts: Record<string, number> = {};
    allPosts.forEach((post) => {
      siteCounts[post.site] = (siteCounts[post.site] || 0) + 1;
    });
    return siteCounts;
  }, [allPosts]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SiteHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">구독 피드 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SiteHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SiteHeader />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">내 구독 피드</h1>
            <button
              onClick={() => router.push('/subscriptions')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              구독 관리
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subscriptions.length}개 커뮤니티 • {allPosts.length.toLocaleString()}개 게시글
          </p>
        </div>

        {/* 사이트별 통계 (선택사항) */}
        {Object.keys(stats).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(stats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([site, count]) => (
                <span
                  key={site}
                  className="px-3 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {site} {count}건
                </span>
              ))}
          </div>
        )}

        {/* 게시글 목록 */}
        {allPosts.length > 0 ? (
          <PostList posts={allPosts} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              구독한 커뮤니티에 게시글이 없습니다.
            </p>
            <button
              onClick={() => router.push('/subscriptions')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              구독 관리하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
