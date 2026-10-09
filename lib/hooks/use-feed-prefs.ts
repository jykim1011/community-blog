'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'feed-prefs-v1';

export interface FeedPrefs {
  /** 제목에 포함되면 피드에서 숨길 키워드 */
  mutedKeywords: string[];
  /** 읽은 글을 피드에서 숨김 */
  hideRead: boolean;
}

const DEFAULT_PREFS: FeedPrefs = { mutedKeywords: [], hideRead: false };

// 설정 페이지와 피드가 같은 값을 보도록 모듈 레벨에서 하나만 둔다.
let prefs: FeedPrefs | null = null;
const listeners = new Set<() => void>();

function load(): FeedPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<FeedPrefs>;
    return {
      mutedKeywords: Array.isArray(parsed.mutedKeywords) ? parsed.mutedKeywords.filter(k => typeof k === 'string') : [],
      hideRead: parsed.hideRead === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function update(patch: Partial<FeedPrefs>) {
  prefs = { ...(prefs ?? load()), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* 저장 실패해도 이번 세션에는 반영 */
  }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (prefs === null) {
    prefs = load();
    listener();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useFeedPrefs() {
  const snapshot = useSyncExternalStore(subscribe, () => prefs, () => null);
  const current = snapshot ?? DEFAULT_PREFS;

  return {
    ...current,
    isLoaded: snapshot !== null,
    addMutedKeyword: (keyword: string) => {
      const k = keyword.trim();
      if (!k || current.mutedKeywords.some(m => m.toLowerCase() === k.toLowerCase())) return;
      update({ mutedKeywords: [...current.mutedKeywords, k] });
    },
    removeMutedKeyword: (keyword: string) =>
      update({ mutedKeywords: current.mutedKeywords.filter(m => m !== keyword) }),
    setHideRead: (hideRead: boolean) => update({ hideRead }),
  };
}

/** 제목이 차단 키워드를 포함하는지 */
export function isMuted(title: string, mutedKeywords: string[]): boolean {
  if (mutedKeywords.length === 0) return false;
  const t = title.toLowerCase();
  return mutedKeywords.some(k => t.includes(k.toLowerCase()));
}
