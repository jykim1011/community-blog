'use client';

import { useState, useEffect } from 'react';

const READ_POSTS_KEY = 'community-blog-read-posts';
const EXPIRY_DAYS = 7; // 7일 후 자동 삭제

interface ReadPost {
  url: string;
  readAt: string;
}

export function useReadPosts() {
  const [readPosts, setReadPosts] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 읽은 게시글 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_POSTS_KEY);
      if (stored) {
        const posts: ReadPost[] = JSON.parse(stored);
        const now = new Date();
        const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        // 만료되지 않은 게시글만 필터링
        const validPosts = posts.filter((post) => {
          const readAt = new Date(post.readAt);
          return now.getTime() - readAt.getTime() < expiryTime;
        });

        // 만료된 게시글이 있으면 로컬 스토리지 업데이트
        if (validPosts.length !== posts.length) {
          localStorage.setItem(READ_POSTS_KEY, JSON.stringify(validPosts));
        }

        setReadPosts(new Set(validPosts.map((p) => p.url)));
      }
    } catch (error) {
      console.error('읽은 게시글 로드 실패:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 게시글을 읽음으로 표시
  const markAsRead = (url: string) => {
    try {
      const stored = localStorage.getItem(READ_POSTS_KEY);
      const posts: ReadPost[] = stored ? JSON.parse(stored) : [];

      // 이미 읽은 게시글인지 확인
      if (posts.some((p) => p.url === url)) {
        return;
      }

      const newPost: ReadPost = {
        url,
        readAt: new Date().toISOString(),
      };

      const newPosts = [newPost, ...posts];
      localStorage.setItem(READ_POSTS_KEY, JSON.stringify(newPosts));
      setReadPosts(new Set([...readPosts, url]));
    } catch (error) {
      console.error('읽은 게시글 저장 실패:', error);
    }
  };

  // 읽은 게시글 여부 확인
  const isRead = (url: string) => {
    return readPosts.has(url);
  };

  // 모든 읽은 기록 삭제
  const clearReadPosts = () => {
    try {
      localStorage.removeItem(READ_POSTS_KEY);
      setReadPosts(new Set());
    } catch (error) {
      console.error('읽은 게시글 삭제 실패:', error);
    }
  };

  // 특정 게시글 읽음 표시 제거
  const unmarkAsRead = (url: string) => {
    try {
      const stored = localStorage.getItem(READ_POSTS_KEY);
      if (!stored) return;

      const posts: ReadPost[] = JSON.parse(stored);
      const newPosts = posts.filter((p) => p.url !== url);

      localStorage.setItem(READ_POSTS_KEY, JSON.stringify(newPosts));
      const newSet = new Set(readPosts);
      newSet.delete(url);
      setReadPosts(newSet);
    } catch (error) {
      console.error('읽은 게시글 제거 실패:', error);
    }
  };

  return {
    isLoaded,
    isRead,
    markAsRead,
    clearReadPosts,
    unmarkAsRead,
  };
}
