'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { PostCard } from '@/components/post-card';
import { SiteFilter } from '@/components/site-filter';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import type { StaticPost, StaticSite } from '@/lib/types';

const POSTS_PER_PAGE = 20;

interface PostListProps {
  posts: StaticPost[];
  sites: StaticSite[];
}

export function PostList({ posts, sites }: PostListProps) {
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedCount, setDisplayedCount] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  // PC/모바일 감지 (md = 768px)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const filteredPosts = useMemo(() => {
    if (!currentSite) return posts;
    return posts.filter((post) => post.site === currentSite);
  }, [posts, currentSite]);

  const displayedPosts = useMemo(() => {
    if (isDesktop) {
      // PC: 페이징 방식
      const start = (currentPage - 1) * POSTS_PER_PAGE;
      const end = start + POSTS_PER_PAGE;
      return filteredPosts.slice(start, end);
    } else {
      // 모바일: 무한 스크롤 방식
      return filteredPosts.slice(0, displayedCount);
    }
  }, [filteredPosts, isDesktop, currentPage, displayedCount]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const hasMore = displayedCount < filteredPosts.length;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 (모바일 전용)
  useEffect(() => {
    if (isDesktop || !hasMore || isLoading) return;

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
  }, [isDesktop, hasMore, isLoading, filteredPosts.length]);

  const handleSiteChange = (site: string | null) => {
    setCurrentSite(site);
    setCurrentPage(1);
    setDisplayedCount(20);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 사이트 필터용 데이터
  const siteFilterData = sites.map((s) => ({
    id: s.name,
    displayName: s.displayName,
    name: s.name,
  }));

  return (
    <>
      {siteFilterData.length > 0 && (
        <SiteFilter
          sites={siteFilterData}
          currentSite={currentSite}
          onSiteChange={handleSiteChange}
        />
      )}

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
          <div className="space-y-1 sm:space-y-1.5">
            {displayedPosts.map((post) => (
              <PostCard
                key={post.id}
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
              />
            ))}
          </div>

          {/* PC: 페이징 버튼 */}
          {isDesktop && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                이전
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  let pageNum: number;

                  if (totalPages <= 10) {
                    pageNum = i + 1;
                  } else if (currentPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 4) {
                    pageNum = totalPages - 9 + i;
                  } else {
                    pageNum = currentPage - 4 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white font-medium'
                          : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                다음
              </button>
            </div>
          )}

          {/* 모바일: 무한 스크롤 로딩 표시기 */}
          {!isDesktop && hasMore && (
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

          {/* 모바일: 완료 메시지 */}
          {!isDesktop && !hasMore && displayedPosts.length > 0 && (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              모든 게시글을 확인했습니다
            </div>
          )}
        </>
      )}
    </>
  );
}
