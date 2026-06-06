'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const posts: StaticPost[] = postsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // 검색 로직: 제목, 작성자, 카테고리에서 검색
  const results = query
    ? posts.filter((post) => {
        const searchLower = query.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(searchLower);
        const authorMatch = post.author?.toLowerCase().includes(searchLower);
        const categoryMatch = post.category?.toLowerCase().includes(searchLower);
        return titleMatch || authorMatch || categoryMatch;
      })
    : [];

  const siteMap = new Map(sites.map((s) => [s.name, s]));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 sm:pb-8">
        {/* 검색 입력 폼 */}
        <div className="mb-6">
          <form action="/search" method="get" className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={query}
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
                <span className="text-blue-600 dark:text-blue-400">"{query}"</span> 검색 결과
              </>
            ) : (
              '검색'
            )}
          </h1>
          {query && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              총 <span className="font-semibold text-gray-900 dark:text-white">{results.length.toLocaleString()}건</span>의
              게시글을 찾았습니다.
            </p>
          )}
        </div>

        {/* 검색 결과 */}
        {query ? (
          results.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {results.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  author={post.author || '알 수 없음'}
                  url={post.url}
                  site={{
                    displayName: siteMap.get(post.site)?.displayName || post.site,
                    name: post.site,
                  }}
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
              <p className="text-gray-600 dark:text-gray-400">
                다른 검색어를 입력해보세요.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔎</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">검색어를 입력하세요</h2>
            <p className="text-gray-600 dark:text-gray-400">
              한국 커뮤니티 인기글을 검색해보세요.
            </p>
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
