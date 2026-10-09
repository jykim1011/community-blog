'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { PostCard } from '@/components/post-card';
import { SiteFilter, FeedCategory } from '@/components/site-filter';
import { SortSelector, SortOption } from '@/components/sort-selector';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useViewerQueue } from '@/lib/hooks/use-viewer-queue';
import { rankTrending } from '@/lib/utils/ranking';
import type { StaticPost } from '@/lib/types';

const POSTS_PER_PAGE = 20;
const INITIAL_COUNT  = 20;

const HOT_THRESHOLD = { views: 5000, comments: 100 };

interface PostListProps {
  posts: StaticPost[];
  selectedSite?: string | null;
  searchQuery?: string | null;
  /** 인앱 뷰어 큐에 이 목록을 등록할지. 같은 페이지에 목록이 둘 이상 마운트될 때 끄면 된다. */
  registerViewerQueue?: boolean;
  /** 카테고리 탭을 sticky 로 고정할 top 값 (모바일 헤더 아래) */
  stickyFilterTop?: string;
}

export function PostList({ posts, selectedSite, searchQuery, registerViewerQueue = true, stickyFilterTop }: PostListProps) {
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useLocalStorage<FeedCategory | null>('feed-category', null);
  const [currentSort, setCurrentSort] = useLocalStorage<SortOption>('feed-sort-v2', 'trending');
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

  // 키워드 필터 변경 시 displayedCount 리셋
  useEffect(() => {
    setDisplayedCount(INITIAL_COUNT);
  }, [searchQuery]);

  const filteredPosts = useMemo(() => {
    let filtered: StaticPost[];

    if (!currentCategory) {
      filtered = posts;
    } else if (currentCategory === 'hot') {
      filtered = posts.filter(
        p => (p.viewCount || 0) > HOT_THRESHOLD.views || (p.commentCount || 0) > HOT_THRESHOLD.comments
      );
    } else {
      filtered = posts.filter(p => p.siteCategory === currentCategory);
    }

    if (currentSite) {
      filtered = filtered.filter(p => p.site === currentSite);
    }

    // 키워드 검색 필터링
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
    }

    if (currentSort === 'trending') return rankTrending(filtered);
    return [...filtered].sort((a, b) =>
      currentSort === 'comments'
        ? (b.commentCount || 0) - (a.commentCount || 0)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts, currentSite, currentCategory, currentSort, searchQuery]);

  const displayedPosts = useMemo(
    () => filteredPosts.slice(0, displayedCount),
    [filteredPosts, displayedCount]
  );

  // 인앱 뷰어에서도 이 목록이 계속 보이도록 등록
  useViewerQueue(filteredPosts, registerViewerQueue);

  const hasMore = displayedCount < filteredPosts.length;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true);
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + POSTS_PER_PAGE, filteredPosts.length));
            setIsLoading(false);
          }, 300);
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, filteredPosts.length]);

  const handleCategoryChange = (category: FeedCategory | null) => {
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

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>

      {/* 카테고리 필터 */}
      <SiteFilter currentCategory={currentCategory} onCategoryChange={handleCategoryChange} stickyTop={stickyFilterTop} />

      {/* 정렬 + 게시글 수 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 8px 4px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>
          <b style={{ color: 'var(--fg-1)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {filteredPosts.length.toLocaleString('ko-KR')}
          </b>개 게시글
        </span>
        <SortSelector currentSort={currentSort} onSortChange={handleSortChange} />
      </div>

      {displayedPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--fg-2)', fontSize: 16, margin: '0 0 8px' }}>게시글이 없습니다.</p>
          <p style={{ color: 'var(--fg-3)', fontSize: 13, margin: 0 }}>
            아직 크롤링된 게시글이 없습니다. 잠시 후 다시 확인해주세요.
          </p>
        </div>
      ) : (
        <>
          <div>
            {displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author}
                url={post.url}
                site={{ displayName: post.siteDisplayName, name: post.site }}
                viewCount={post.viewCount}
                commentCount={post.commentCount}
                likeCount={post.likeCount}
                createdAt={new Date(post.createdAt)}
                category={post.category}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={loadMoreRef} style={{ padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-3)' }}>
                  <svg className="animate-spin" width={20} height={20} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span style={{ fontSize: 13 }}>로딩 중...</span>
                </div>
              ) : (
                <div style={{ height: 16 }} />
              )}
            </div>
          )}

          {!hasMore && displayedPosts.length > 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--fg-4)' }}>
              모든 게시글을 확인했습니다
            </div>
          )}
        </>
      )}
    </PullToRefresh>
  );
}
