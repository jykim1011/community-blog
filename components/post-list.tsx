'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { PostCard } from '@/components/post-card';
import { SiteFilter, FeedCategory } from '@/components/site-filter';
import { SortSelector, SortOption } from '@/components/sort-selector';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useViewerQueue } from '@/lib/hooks/use-viewer-queue';
import { rankTrending } from '@/lib/utils/ranking';
import { useFeedPrefs, isMuted } from '@/lib/hooks/use-feed-prefs';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
import type { StaticPost } from '@/lib/types';

const POSTS_PER_PAGE = 20;
const INITIAL_COUNT  = 20;

const HOT_THRESHOLD = { views: 5000, comments: 100 };
// 댓글순은 최근 글만 — 기간 제한이 없으면 일주일 묵은 글이 늘 맨 위를 차지한다.
const COMMENTS_WINDOW_MS = 24 * 60 * 60 * 1000;

interface PostListProps {
  posts: StaticPost[];
  selectedSite?: string | null;
  searchQuery?: string | null;
  /** 인앱 뷰어 큐에 이 목록을 등록할지. 같은 페이지에 목록이 둘 이상 마운트될 때 끄면 된다. */
  registerViewerQueue?: boolean;
  /** 카테고리 탭을 sticky 로 고정할 top 값 (모바일 헤더 아래) */
  stickyFilterTop?: string;
  /** 당겨서 새로고침 시 데이터만 다시 받는다. 새 글 수를 돌려준다. 없으면 페이지를 reload 한다. */
  onRefresh?: () => Promise<number>;
}

export function PostList({ posts, selectedSite, searchQuery, registerViewerQueue = true, stickyFilterTop, onRefresh }: PostListProps) {
  const { mutedKeywords, hideRead } = useFeedPrefs();
  const { isRead, isLoaded: readLoaded } = useReadPosts();
  const [toast, setToast] = useState<string | null>(null);

  // 읽은 글 숨기기: 읽는 즉시 목록에서 빠지면 뷰어의 이전/다음 순서가 어긋나므로
  // 목록이 바뀔 때(새로고침·설정 변경) 시점의 읽음 목록으로만 거른다.
  const [hiddenRead, setHiddenRead] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    if (!hideRead || !readLoaded) { setHiddenRead(new Set()); return; }
    setHiddenRead(new Set(posts.filter(p => isRead(p.url)).map(p => p.url)));
  }, [posts, hideRead, readLoaded]);
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

    if (mutedKeywords.length > 0) {
      filtered = filtered.filter(p => !isMuted(p.title, mutedKeywords));
    }
    if (hiddenRead.size > 0) {
      filtered = filtered.filter(p => !hiddenRead.has(p.url));
    }

    // 키워드 검색 필터링
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
    }

    if (currentSort === 'trending') return rankTrending(filtered);
    if (currentSort === 'comments') {
      // 기준 시각은 가장 최근 글 — 서버/클라이언트 렌더 결과가 같아야 한다.
      const newest = filtered.reduce((m, p) => Math.max(m, new Date(p.createdAt).getTime()), 0);
      return filtered
        .filter(p => newest - new Date(p.createdAt).getTime() <= COMMENTS_WINDOW_MS)
        .sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    }
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, currentSite, currentCategory, currentSort, searchQuery, mutedKeywords, hiddenRead]);

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRefresh = async () => {
    if (!onRefresh) {
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
      return;
    }
    try {
      const added = await onRefresh();
      setDisplayedCount(INITIAL_COUNT);
      setToast(added > 0 ? `새 글 ${added.toLocaleString('ko-KR')}개를 불러왔어요` : '이미 최신 글이에요');
    } catch {
      setToast('새로고침에 실패했어요. 잠시 후 다시 시도해주세요');
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {toast && (
        <div role="status" style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)', zIndex: 40,
          padding: '10px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
          background: 'rgba(24,24,27,.92)', color: '#fff', whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,.18)',
        }}>
          {toast}
        </div>
      )}

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
            {mutedKeywords.length > 0 || hiddenRead.size > 0
              ? '차단 키워드나 읽은 글 숨기기 때문에 가려졌을 수 있어요. 설정에서 확인해보세요.'
              : '아직 크롤링된 게시글이 없습니다. 잠시 후 다시 확인해주세요.'}
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
