'use client';

import { useState, useMemo } from 'react';
import { PostCard } from '@/components/post-card';
import { SiteFilter } from '@/components/site-filter';
import type { StaticPost, StaticSite } from '@/lib/types';

const POSTS_PER_PAGE = 20;

interface PostListProps {
  posts: StaticPost[];
  sites: StaticSite[];
}

export function PostList({ posts, sites }: PostListProps) {
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (!currentSite) return posts;
    return posts.filter((post) => post.site === currentSite);
  }, [posts, currentSite]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleSiteChange = (site: string | null) => {
    setCurrentSite(site);
    setCurrentPage(1);
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

      {paginatedPosts.length === 0 ? (
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
            {paginatedPosts.map((post) => (
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
              />
            ))}
          </div>

          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

function ClientPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const btnBase = 'px-3 py-2 text-sm rounded-lg';
  const btnActive = `${btnBase} font-semibold text-white bg-blue-600`;
  const btnNormal = `${btnBase} text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`;
  const btnDisabled = `${btnBase} text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed`;

  return (
    <nav className="mt-4 sm:mt-5 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={currentPage > 1 ? btnNormal : btnDisabled}
      >
        이전
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btnNormal}>1</button>
          {start > 2 && (
            <span className="px-2 py-2 text-sm text-gray-400 dark:text-gray-600">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? btnActive : btnNormal}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-2 py-2 text-sm text-gray-400 dark:text-gray-600">...</span>
          )}
          <button onClick={() => onPageChange(totalPages)} className={btnNormal}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={currentPage < totalPages ? btnNormal : btnDisabled}
      >
        다음
      </button>
    </nav>
  );
}
