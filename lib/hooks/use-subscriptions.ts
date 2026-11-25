'use client';

import { useMemo } from 'react';
import { setStoredItem, useHydrated, useStoredItem } from './use-client-value';

const STORAGE_KEY = 'community-subscriptions';

export interface Subscription {
  sites: string[]; // 구독한 사이트 이름 배열
}

export function useSubscriptions() {
  // 로컬 스토리지의 구독 정보 (설정 화면에서 바꾸면 피드도 바로 같은 값을 본다)
  const stored = useStoredItem(STORAGE_KEY);
  const isLoaded = useHydrated();
  const subscriptions = useMemo<string[]>(() => {
    if (!stored) return [];
    try {
      const data: Subscription = JSON.parse(stored);
      return data.sites || [];
    } catch (error) {
      console.error('Failed to parse subscriptions:', error);
      return [];
    }
  }, [stored]);

  // 구독 정보 저장
  const saveSubscriptions = (sites: string[]) => {
    const data: Subscription = { sites };
    setStoredItem(STORAGE_KEY, JSON.stringify(data));
  };

  // 사이트 구독 추가
  const subscribe = (siteName: string) => {
    if (!subscriptions.includes(siteName)) {
      const newSubscriptions = [...subscriptions, siteName];
      saveSubscriptions(newSubscriptions);
    }
  };

  // 사이트 구독 취소
  const unsubscribe = (siteName: string) => {
    const newSubscriptions = subscriptions.filter((s) => s !== siteName);
    saveSubscriptions(newSubscriptions);
  };

  // 사이트 구독 토글
  const toggleSubscription = (siteName: string) => {
    if (subscriptions.includes(siteName)) {
      unsubscribe(siteName);
    } else {
      subscribe(siteName);
    }
  };

  // 사이트 구독 여부 확인
  const isSubscribed = (siteName: string) => {
    return subscriptions.includes(siteName);
  };

  // 모든 구독 취소
  const clearSubscriptions = () => {
    saveSubscriptions([]);
  };

  return {
    subscriptions,
    isLoaded,
    subscribe,
    unsubscribe,
    toggleSubscription,
    isSubscribed,
    clearSubscriptions,
  };
}
