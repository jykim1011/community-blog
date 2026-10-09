'use client';

import { useSyncExternalStore } from 'react';

const READ_POSTS_KEY = 'community-blog-read-posts';
const EXPIRY_DAYS = 7; // 7일 후 자동 삭제

interface ReadPost {
  url: string;
  readAt: string;
}

// ── 모듈 레벨 공유 상태 ─────────────────────────────────────────
// 읽음 목록은 페이지 전체에서 하나여야 한다. 인스턴스마다 Set 을 따로 들면
// 뷰어에서 읽음 처리한 글이 피드/스트립에는 계속 안읽음으로 보인다.
let readCache: Set<string> | null = null;
const listeners = new Set<() => void>();

function publish(next: Set<string>) {
  readCache = next;
  listeners.forEach(listener => listener());
}

/** 아직 로컬 스토리지를 읽지 않았다면 지금 읽는다. */
function ensureLoaded() {
  if (readCache === null) publish(loadFromStorage());
}

function loadFromStorage(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_POSTS_KEY);
    if (!stored) return new Set();

    const posts: ReadPost[] = JSON.parse(stored);
    const now = Date.now();
    const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    // 만료되지 않은 게시글만 필터링
    const validPosts = posts.filter(post => now - new Date(post.readAt).getTime() < expiryTime);

    // 만료된 게시글이 있으면 로컬 스토리지 업데이트
    if (validPosts.length !== posts.length) {
      localStorage.setItem(READ_POSTS_KEY, JSON.stringify(validPosts));
    }

    return new Set(validPosts.map(p => p.url));
  } catch (error) {
    console.error('읽은 게시글 로드 실패:', error);
    return new Set();
  }
}

/**
 * 게시글을 읽음으로 표시한다. 훅 밖(컨텍스트 등)에서도 호출할 수 있다.
 */
export function markPostAsRead(url: string) {
  ensureLoaded();
  if (readCache?.has(url)) return;

  try {
    const stored = localStorage.getItem(READ_POSTS_KEY);
    const posts: ReadPost[] = stored ? JSON.parse(stored) : [];

    if (!posts.some(p => p.url === url)) {
      localStorage.setItem(
        READ_POSTS_KEY,
        JSON.stringify([{ url, readAt: new Date().toISOString() }, ...posts])
      );
    }
  } catch (error) {
    console.error('읽은 게시글 저장 실패:', error);
  }

  publish(new Set(readCache ?? []).add(url));
}

export function unmarkPostAsRead(url: string) {
  try {
    const stored = localStorage.getItem(READ_POSTS_KEY);
    if (stored) {
      const posts: ReadPost[] = JSON.parse(stored);
      localStorage.setItem(READ_POSTS_KEY, JSON.stringify(posts.filter(p => p.url !== url)));
    }
  } catch (error) {
    console.error('읽은 게시글 제거 실패:', error);
  }

  const next = new Set(readCache ?? []);
  next.delete(url);
  publish(next);
}

export function clearAllReadPosts() {
  try {
    localStorage.removeItem(READ_POSTS_KEY);
  } catch (error) {
    console.error('읽은 게시글 삭제 실패:', error);
  }
  publish(new Set());
}

const EMPTY: ReadonlySet<string> = new Set();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 첫 구독자가 로컬 스토리지를 읽어 캐시를 채운다.
  ensureLoaded();
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => readCache;
// 서버 렌더에서는 항상 '아직 로드 안 됨' — 하이드레이션 후 실제 값으로 교체된다.
const getServerSnapshot = () => null;

export function useReadPosts() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const readPosts = snapshot ?? EMPTY;

  return {
    isLoaded: snapshot !== null,
    isRead: (url: string) => readPosts.has(url),
    markAsRead: markPostAsRead,
    clearReadPosts: clearAllReadPosts,
    unmarkAsRead: unmarkPostAsRead,
  };
}
