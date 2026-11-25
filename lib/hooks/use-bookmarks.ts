'use client';

import { useMemo } from 'react';
import { setStoredItem, useHydrated, useStoredItem } from './use-client-value';

const BOOKMARKS_KEY = 'community-blog-bookmarks';

interface Bookmark {
  url: string;
  title: string;
  site: string;
  bookmarkedAt: string;
}

export function useBookmarks() {
  // 로컬 스토리지의 북마크 (모든 카드·화면이 같은 목록을 본다)
  const stored = useStoredItem(BOOKMARKS_KEY);
  const isLoaded = useHydrated();
  const bookmarks = useMemo<Bookmark[]>(() => {
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('북마크 로드 실패:', error);
      return [];
    }
  }, [stored]);

  // 북마크 저장
  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    setStoredItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
  };

  // 북마크 추가
  const addBookmark = (url: string, title: string, site: string) => {
    const newBookmark: Bookmark = {
      url,
      title,
      site,
      bookmarkedAt: new Date().toISOString(),
    };
    const newBookmarks = [newBookmark, ...bookmarks];
    saveBookmarks(newBookmarks);
  };

  // 북마크 제거
  const removeBookmark = (url: string) => {
    const newBookmarks = bookmarks.filter((b) => b.url !== url);
    saveBookmarks(newBookmarks);
  };

  // 북마크 여부 확인
  const isBookmarked = (url: string) => {
    return bookmarks.some((b) => b.url === url);
  };

  // 북마크 토글
  const toggleBookmark = (url: string, title: string, site: string) => {
    if (isBookmarked(url)) {
      removeBookmark(url);
    } else {
      addBookmark(url, title, site);
    }
  };

  // 모든 북마크 제거
  const clearBookmarks = () => {
    saveBookmarks([]);
  };

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
  };
}
