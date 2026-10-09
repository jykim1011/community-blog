'use client';

import { useEffect, useState } from 'react';
import { useViewer, type ViewerItem } from '@/lib/contexts/viewer-context';
import { siteTheme } from '@/lib/site-theme';
import { isDomainBlocked } from '@/lib/utils/blocked-domains';
import type { StaticPost } from '@/lib/types';

const MAX_QUEUE = 300;

export function toViewerItem(post: StaticPost): ViewerItem {
  return {
    url: post.url,
    site: post.siteDisplayName,
    siteName: post.site,
    title: post.title,
    color: siteTheme(post.site, post.siteDisplayName).color,
  };
}

/**
 * 현재 화면의 목록을 인앱 뷰어에 등록한다.
 * 뷰어를 열어도 이 목록이 계속 보이고, 바로 다른 글로 이동할 수 있다.
 *
 * 큐는 전역 슬롯 하나이므로, 같은 시점에 여러 목록이 마운트돼 있으면
 * (예: CSS로만 숨긴 데스크톱/모바일 레이아웃) 실제 보이는 목록만 `enabled`로
 * 등록해야 한다. 그렇지 않으면 나중에 실행된 쪽이 큐를 덮어쓴다.
 */
export function useViewerQueue(posts: StaticPost[], enabled = true) {
  const { setQueue, clearQueue } = useViewer();
  // 이 목록이 큐의 주인인지 구분하는 토큰
  const [owner] = useState(() => Symbol('viewer-queue'));

  useEffect(() => {
    if (!enabled) return;
    setQueue(
      posts
        .filter(p => !isDomainBlocked(p.url))
        .slice(0, MAX_QUEUE)
        .map(toViewerItem),
      owner
    );
  }, [posts, enabled, owner, setQueue]);

  // 언마운트 시에만 정리한다. 이미 다른 목록이 큐를 가져갔으면 clearQueue 가 무시한다.
  useEffect(() => () => clearQueue(owner), [owner, clearQueue]);
}
