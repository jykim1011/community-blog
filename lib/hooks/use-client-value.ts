'use client';

import { useSyncExternalStore } from 'react';

// 정적 export 라 서버 HTML 과 첫 렌더(하이드레이션)가 같아야 한다.
// 브라우저에서만 아는 값(localStorage·UA·현재 시각 등)은 예전엔 effect 안에서 setState 로 넣었는데,
// 그러면 렌더가 한 번 더 돈다. useSyncExternalStore 는 하이드레이션 때 서버 값을 쓰고
// 바로 이어서 브라우저 값으로 다시 그려 주므로 같은 결과를 effect 없이 얻는다.

type Subscribe = (onChange: () => void) => () => void;

const noopSubscribe: Subscribe = () => () => {};

/** 하이드레이션이 끝나 브라우저 값을 써도 되면 true (서버·하이드레이션 중에는 false) */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/**
 * 브라우저에서만 읽을 수 있는 값. 서버·하이드레이션 중에는 serverValue.
 * getValue 는 같은 상황에서 같은 값(원시값 또는 같은 객체)을 돌려줘야 한다.
 */
export function useClientValue<T>(getValue: () => T, serverValue: T, subscribe: Subscribe = noopSubscribe): T {
  return useSyncExternalStore(subscribe, getValue, () => serverValue);
}

/** Capacitor 앱의 WebView 안에서 열렸는지 (서버·하이드레이션 중에는 false) */
export function useIsCapacitorApp(): boolean {
  return useClientValue(
    () => window.location.protocol === 'capacitor:' || (window as unknown as { Capacitor?: unknown }).Capacitor !== undefined,
    false,
  );
}

// ── localStorage 항목 (탭 안의 모든 컴포넌트가 같은 값을 본다) ──────────────

const storageCache = new Map<string, string | null>();
const storageListeners = new Set<() => void>();
let storageEventBound = false;

function readStored(key: string): string | null {
  if (!storageCache.has(key)) {
    let value: string | null = null;
    try {
      value = localStorage.getItem(key);
    } catch {
      // 저장소를 못 쓰는 환경 (사생활 보호 모드 등)
    }
    storageCache.set(key, value);
  }
  return storageCache.get(key) ?? null;
}

function subscribeStorage(listener: () => void) {
  storageListeners.add(listener);
  if (!storageEventBound) {
    storageEventBound = true;
    // 다른 탭에서 바뀌면 캐시를 비우고 다시 읽는다
    window.addEventListener('storage', (e) => {
      if (e.key === null) storageCache.clear();
      else storageCache.delete(e.key);
      storageListeners.forEach((l) => l());
    });
  }
  return () => {
    storageListeners.delete(listener);
  };
}

/** localStorage 문자열 값. 서버·하이드레이션 중에는 null */
export function useStoredItem(key: string): string | null {
  return useSyncExternalStore(subscribeStorage, () => readStored(key), () => null);
}

/** localStorage 에 쓰고(null 이면 지움) 같은 키를 보는 컴포넌트를 모두 다시 그린다 */
export function setStoredItem(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // 저장 못 해도 이번 실행 동안은 메모리 값으로 유지한다
  }
  storageCache.set(key, value);
  storageListeners.forEach((l) => l());
}

// ── 현재 시각 ────────────────────────────────────────────────

let nowValue = 0;
let nowTimer: ReturnType<typeof setInterval> | null = null;
const nowListeners = new Set<() => void>();

function subscribeNow(listener: () => void) {
  nowListeners.add(listener);
  if (!nowTimer) {
    // 한동안 아무도 안 보고 있었으면 멈춰 있던 시각을 지금으로 (React 가 구독 직후 다시 읽는다)
    nowValue = Date.now();
    // 모든 컴포넌트가 타이머 하나를 같이 쓴다 (예전엔 카드마다 setInterval)
    nowTimer = setInterval(() => {
      nowValue = Date.now();
      nowListeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    nowListeners.delete(listener);
    if (nowListeners.size === 0 && nowTimer) {
      clearInterval(nowTimer);
      nowTimer = null;
    }
  };
}

function getNow() {
  if (nowValue === 0) nowValue = Date.now();
  return nowValue;
}

/** 1분마다 갱신되는 현재 시각(ms). 서버·하이드레이션 중에는 null */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeNow, getNow, () => null);
}

const pageLoadedAt = { value: 0 };

/** 페이지를 연 시각(ms, 이번 실행 동안 고정). 서버·하이드레이션 중에는 null */
export function usePageLoadTime(): number | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (pageLoadedAt.value === 0) pageLoadedAt.value = Date.now();
      return pageLoadedAt.value;
    },
    () => null,
  );
}
