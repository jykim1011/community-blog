'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { PostCard } from '@/components/post-card';
import { SiteFilter } from '@/components/site-filter';
import { SortSelector, SortOption } from '@/components/sort-selector';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { SiteCategory } from '@/lib/constants';
import type { StaticPost, StaticSite } from '@/lib/types';

const POSTS_PER_PAGE = 20;
const INITIAL_COUNT = 20;

interface PostListProps {
  posts: StaticPost[];
  sites: StaticSite[];
  selectedSite?: string | null;
}

export function PostList({ posts, sites, selectedSite }: PostListProps) {
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useLocalStorage<SiteCategory | null>('feed-category', null);
  const [currentSort, setCurrentSort] = useLocalStorage<SortOption>('feed-sort', 'recent');
  const [displayedCount, setDisplayedCount] = useState(INITIAL_COUNT);
  const [isLoading, setIsLoading] = useState(false);

  // 사이드바에서 사이트 선택 시 동기화
  useEffect(() => {
    if (selectedSite !== undefined) {
      setCurrentSite(selectedSite ?? null);
      setDisplayedCount(INITIAL_COUNT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSite]);

const filteredPosts = useMemo(() => {
    // 1. 카테고리 필터링 (사이트 카테고리 기준)
    let filtered = currentCategory
      ? posts.filter((post) => post.siteCategory === currentCategory)
      : posts;

    // 2. 사이트 필터링
    filtered = currentSite
      ? filtered.filter((post) => post.site === currentSite)
      : filtered;

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      switch (currentSort) {
        case 'popular': {
          // 인기도순: (조회수 * 0.1) + (댓글 * 5) + (좋아요 * 2)
          const scoreA = (a.viewCount || 0) * 0.1 + (a.commentCount || 0) * 5 + (a.likeCount || 0) * 2;
          const scoreB = (b.viewCount || 0) * 0.1 + (b.commentCount || 0) * 5 + (b.likeCount || 0) * 2;
          return scoreB - scoreA;
        }
        case 'comments': {
          // 댓글순
          return (b.commentCount || 0) - (a.commentCount || 0);
        }
        case 'recent': {
          // 최신순
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [posts, currentSite, currentCategory, currentSort]);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, displayedCount);
  }, [filteredPosts, displayedCount]);

  const hasMore = displayedCount < filteredPosts.length;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true);

          setTimeout(() => {
            setDisplayedCount(prev =>
              Math.min(prev + POSTS_PER_PAGE, filteredPosts.length)
            );
            setIsLoading(false);
          }, 300);
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, filteredPosts.length]);

  const handleSiteChange = (site: string | null) => {
    setCurrentSite(site);
    setDisplayedCount(INITIAL_COUNT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: SiteCategory | null) => {
    setCurrentCategory(category);
    setCurrentSite(null);
    setDisplayedCount(INITIAL_COUNT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setDisplayedCount(INITIAL_COUNT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pull-to-Refresh 핸들러
  const handleRefresh = async () => {
    // 약간의 딜레이 후 페이지 새로고침 (최신 데이터 가져오기)
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  };

  // 사이트 필터용 데이터
  const siteFilterData = sites.map((s) => ({
    id: s.name,
    displayName: s.displayName,
    name: s.name,
    category: s.category,
  }));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* 사이트 필터 */}
      {siteFilterData.length > 0 && (
        <SiteFilter
          sites={siteFilterData}
          currentSite={currentSite}
          currentCategory={currentCategory}
          onSiteChange={handleSiteChange}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* 정렬 선택기 */}
      <div className="py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <SortSelector
          currentSort={currentSort}
          onSortChange={handleSortChange}
        />
      </div>

      {displayedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            게시글이 없습니다.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            아직 크롤링된 게시글이 없습니다. 잠시 후 다시 확인해주세요.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {displayedPosts.map((post) => (
              <div key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  author={post.author}
                  url={post.url}
                  site={{
                    displayName: post.siteDisplayName,
                    name: post.site,
                  }}
                  viewCount={post.viewCount}
                  commentCount={post.commentCount}
                  likeCount={post.likeCount}
                  createdAt={new Date(post.createdAt)}
                  thumbnail={post.thumbnail}
                  category={post.category}
                />
              </div>
            ))}
          </div>

          {/* 무한 스크롤 로딩 표시기 */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm">로딩 중...</span>
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}

          {/* 완료 메시지 */}
          {!hasMore && displayedPosts.length > 0 && (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              모든 게시글을 확인했습니다
            </div>
          )}
        </>
      )}
    </PullToRefresh>
  );
}
