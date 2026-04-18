'use client';

import { useBookmarks } from '@/lib/hooks/use-bookmarks';

interface BookmarkButtonProps {
  url: string;
  title: string;
  site: string;
}

export function BookmarkButton({ url, title, site }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isLoaded } = useBookmarks();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(url, title, site);
  };

  if (!isLoaded) {
    return null; // 로드 전에는 렌더링하지 않음 (hydration 오류 방지)
  }

  const bookmarked = isBookmarked(url);

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={bookmarked ? '북마크 제거' : '북마크 추가'}
      aria-label={bookmarked ? '북마크 제거' : '북마크 추가'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        className={`w-4 h-4 ${
          bookmarked
            ? 'text-yellow-500 dark:text-yellow-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}
        strokeWidth={bookmarked ? 0 : 2}
      >
        <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    </button>
  );
}
