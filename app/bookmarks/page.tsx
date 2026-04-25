'use client';

import { useBookmarks } from '@/lib/hooks/use-bookmarks';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
import { siteConfigs } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';
import { InAppBrowser } from '@capgo/inappbrowser';

export default function BookmarksPage() {
  const { bookmarks, isLoaded, removeBookmark, clearBookmarks } = useBookmarks();
  const { clearReadPosts } = useReadPosts();

  const handleLinkClick = async (e: React.MouseEvent | React.KeyboardEvent, url: string) => {
    if (Capacitor.isNativePlatform()) {
      e.preventDefault();
      try {
        const height = Math.round(window.screen.height) - 60;
        await InAppBrowser.openWebView({ url, height });
      } catch {
        window.open(url, '_blank');
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              북마크
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {bookmarks.length}개의 게시글을 저장했습니다
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('모든 읽은 기록을 삭제하시겠습니까?')) {
                  clearReadPosts();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              읽은 기록 삭제
            </button>
            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('모든 북마크를 삭제하시겠습니까?')) {
                    clearBookmarks();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                북마크 전체 삭제
              </button>
            )}
          </div>
        </div>

        {/* 북마크 목록 */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📌</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              저장된 북마크가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              관심있는 게시글을 북마크하여 나중에 다시 볼 수 있습니다
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => {
              const siteConfig = siteConfigs[bookmark.site];
              const displayName = siteConfig?.displayName || bookmark.site;

              return (
                <div
                  key={bookmark.url}
                  className="block px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e, bookmark.url)}
                      onKeyDown={(e) => { if (e.key === ' ') handleLinkClick(e, bookmark.url); }}
                      className="flex-1 min-w-0"
                    >
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {bookmark.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {displayName}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span>
                          저장: {formatRelativeTime(new Date(bookmark.bookmarkedAt))}
                        </span>
                      </div>
                    </a>

                    <button
                      onClick={() => {
                        if (confirm('이 북마크를 삭제하시겠습니까?')) {
                          removeBookmark(bookmark.url);
                        }
                      }}
                      className="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="북마크 제거"
                      aria-label="북마크 제거"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
