'use client';

import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { markPostAsRead } from '@/lib/hooks/use-read-posts';

export interface ViewerItem {
  url: string;
  /** 사이트 표시 이름 (예: 디시인사이드) */
  site: string;
  /** 사이트 키 (예: dcinside) — 배지/파비콘용 */
  siteName?: string;
  color: string;
  title?: string;
}

interface ViewerContextValue {
  viewer: ViewerItem | null;
  /** 뷰어에서 이어서 볼 수 있는 글 목록 (현재 화면의 피드) */
  queue: ViewerItem[];
  /** queue 내 현재 글의 위치. 목록에 없으면 -1 */
  index: number;
  openViewer: (item: ViewerItem) => void;
  closeViewer: () => void;
  /** 현재 화면의 목록을 뷰어에 등록. owner 는 등록 주체를 구분하는 토큰. */
  setQueue: (items: ViewerItem[], owner?: symbol) => void;
  /** 자신이 등록한 큐일 때만 비운다. */
  clearQueue: (owner: symbol) => void;
  goNext: () => void;
  goPrev: () => void;
  preloadUrl: string | null;
  preloadViewer: (url: string) => void;
  cancelPreload: () => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<ViewerItem | null>(null);
  const [queue, setQueueState] = useState<ViewerItem[]>([]);
  const [preloadUrl, setPreloadUrl] = useState<string | null>(null);
  const queueRef = useRef<ViewerItem[]>([]);
  const queueOwnerRef = useRef<symbol | null>(null);
  // step() 에서 동기적으로 현재 글을 읽기 위한 미러. setViewer 와 항상 함께 갱신한다.
  const viewerRef = useRef<ViewerItem | null>(null);

  const setQueue = useCallback((items: ViewerItem[], owner?: symbol) => {
    queueOwnerRef.current = owner ?? null;
    // 같은 목록이면 리렌더 방지
    const prev = queueRef.current;
    if (prev.length === items.length && prev.every((p, i) => p.url === items[i].url)) return;
    queueRef.current = items;
    setQueueState(items);
  }, []);

  // 등록했던 목록이 사라질 때 호출. 이미 다른 목록이 큐를 가져갔다면 무시한다.
  const clearQueue = useCallback((owner: symbol) => {
    if (queueOwnerRef.current !== owner) return;
    queueOwnerRef.current = null;
    queueRef.current = [];
    setQueueState([]);
  }, []);

  const openViewer = useCallback((item: ViewerItem) => {
    setPreloadUrl(null);
    viewerRef.current = item;
    setViewer(item);
  }, []);

  const closeViewer = useCallback(() => {
    viewerRef.current = null;
    setViewer(null);
  }, []);

  const index = useMemo(
    () => (viewer ? queue.findIndex(q => q.url === viewer.url) : -1),
    [viewer, queue]
  );

  const step = useCallback((delta: number) => {
    const current = viewerRef.current;
    if (!current) return;
    const list = queueRef.current;
    const i = list.findIndex(q => q.url === current.url);
    if (i === -1) return;
    const target = list[i + delta];
    if (!target) return;
    // 카드/스트립에서 여는 경로와 동일하게 읽음 처리한다.
    markPostAsRead(target.url);
    viewerRef.current = target;
    setViewer(target);
  }, []);

  const goNext = useCallback(() => step(1), [step]);
  const goPrev = useCallback(() => step(-1), [step]);

  const preloadViewer = useCallback((url: string) => setPreloadUrl(url), []);
  const cancelPreload = useCallback(() => setPreloadUrl(null), []);

  return (
    <ViewerContext.Provider
      value={{
        viewer, queue, index,
        openViewer, closeViewer, setQueue, clearQueue, goNext, goPrev,
        preloadUrl, preloadViewer, cancelPreload,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error('useViewer must be used within ViewerProvider');
  return ctx;
}
