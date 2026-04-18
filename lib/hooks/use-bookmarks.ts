'use client';

import { useState, useEffect } from 'react';

const BOOKMARKS_KEY = 'community-blog-bookmarks';

interface Bookmark {
  url: string;
  title: string;
  site: string;
  bookmarkedAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 북마크 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('북마크 로드 실패:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 북마크 저장
  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('북마크 저장 실패:', error);
    }
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
