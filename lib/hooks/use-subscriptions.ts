'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'community-subscriptions';

export interface Subscription {
  sites: string[]; // 구독한 사이트 이름 배열
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 구독 정보 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data: Subscription = JSON.parse(stored);
          setSubscriptions(data.sites || []);
        } catch (error) {
          console.error('Failed to parse subscriptions:', error);
          setSubscriptions([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // 구독 정보 저장
  const saveSubscriptions = (sites: string[]) => {
    if (typeof window !== 'undefined') {
      const data: Subscription = { sites };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSubscriptions(sites);
    }
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
