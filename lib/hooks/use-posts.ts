'use client';

import { useEffect, useState } from 'react';
import {
  decodePostsPayload,
  POSTS_PAYLOAD_URL,
  type PostsPayload,
} from '@/lib/utils/posts-payload';
import type { StaticPost } from '@/lib/types';

/** 같은 세션 안에서 여러 페이지가 재사용하는 메모리 캐시 */
let cache: StaticPost[] | null = null;
let inflight: Promise<StaticPost[]> | null = null;

function loadAll(): Promise<StaticPost[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetch(POSTS_PAYLOAD_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`posts payload ${res.status}`);
      return res.json() as Promise<PostsPayload>;
    })
    .then((payload) => {
      cache = decodePostsPayload(payload);
      return cache;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

interface Options {
  /** SSR 로 인라인된 첫 화면용 게시글 (SEO + 즉시 렌더) */
  initial?: StaticPost[];
}

/**
 * 전체 게시글 목록.
 * 초기에는 인라인된 슬라이스만 보여주고, 마운트 직후 전체를 받아 교체한다.
 */
export function usePosts({ initial = [] }: Options = {}) {
  const [posts, setPosts] = useState<StaticPost[]>(cache ?? initial);
  const [isComplete, setIsComplete] = useState(cache !== null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cache) return;
    let alive = true;

    loadAll()
      .then((all) => {
        if (!alive) return;
        setPosts(all);
        setIsComplete(true);
      })
      .catch((e) => {
        if (alive) setError(e as Error);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { posts, isComplete, error };
}
