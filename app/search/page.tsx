'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { usePosts } from '@/lib/hooks/use-posts';
import type { StaticPost } from '@/lib/types';

const MAX_RESULTS = 200;

type SortKey = 'relevance' | 'recent' | 'popular';

const SORT_LABELS: Record<SortKey, string> = {
  relevance: '정확도순',
  recent: '최신순',
  popular: '인기순',
};

const popularity = (p: StaticPost) =>
  (p.viewCount || 0) * 0.1 + (p.commentCount || 0) * 5 + (p.likeCount || 0) * 2;

/** 제목 앞부분 일치 > 제목 포함 > 작성자/카테고리 일치 순으로 가중치 */
function relevance(post: StaticPost, q: string): number {
  const title = post.title.toLowerCase();
  const idx = title.indexOf(q);
  if (idx === 0) return 3;
  if (idx > 0) return 2;
  if (post.author?.toLowerCase().includes(q)) return 1;
  if (post.category?.toLowerCase().includes(q)) return 1;
  return 0;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>('relevance');
  const { posts, isComplete } = usePosts();

  // 입력 디바운스 — 타이핑마다 7천 건을 훑지 않도록
  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 200);
    return () => clearTimeout(t);
  }, [input]);

  // 검색어를 URL 에 반영 (뒤로가기/공유 가능하도록)
  useEffect(() => {
    const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
    window.history.replaceState(null, '', url);
  }, [query]);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    const scored = posts
      .map((post) => ({ post, score: relevance(post, q) }))
      .filter((r) => r.score > 0);

    scored.sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
      }
      if (sort === 'popular') return popularity(b.post) - popularity(a.post);
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
    });

    return scored.slice(0, MAX_RESULTS).map((r) => r.post);
  }, [posts, query, sort]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-8">
        <div className="mb-6">
          <form
            role="search"
            onSubmit={(e) => { e.preventDefault(); setQuery(input.trim()); }}
            className="mb-4"
          >
            <label htmlFor="search-input" className="sr-only">게시글 검색</label>
            <div className="flex gap-2">
              <input
                id="search-input"
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="게시글, 작성자, 카테고리 검색..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                검색
              </button>
            </div>
          </form>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {query ? (
              <>
                <span className="text-blue-600 dark:text-blue-400">&ldquo;{query}&rdquo;</span> 검색 결과
              </>
            ) : (
              '검색'
            )}
          </h1>

          {query && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                {!isComplete ? (
                  '검색 데이터를 불러오는 중...'
                ) : (
                  <>
                    총 <span className="font-semibold text-gray-900 dark:text-white">
                      {results.length.toLocaleString()}건
                    </span>
                    {results.length === MAX_RESULTS && ' 이상'}의 게시글을 찾았습니다.
                  </>
                )}
              </p>

              <div className="flex gap-1" role="group" aria-label="검색 결과 정렬">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSort(key)}
                    aria-pressed={sort === key}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      sort === key
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!query ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔎</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">검색어를 입력하세요</h2>
            <p className="text-gray-600 dark:text-gray-400">한국 커뮤니티 인기글을 검색해보세요.</p>
          </div>
        ) : !isComplete ? (
          <div className="space-y-2 sm:space-y-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-gray-200/70 dark:bg-gray-800/70 animate-pulse"
              />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {results.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author || '알 수 없음'}
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
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">검색 결과가 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-400">다른 검색어를 입력해보세요.</p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SiteHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
        </div>
        <SiteFooter />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
