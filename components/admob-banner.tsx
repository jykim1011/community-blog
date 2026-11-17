'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { getAdFreeUntil, subscribeAdFree } from '@/lib/ad-free';

interface AdMobBannerProps {
  position?: 'top' | 'bottom';
}

export function AdMobBanner({ position = 'bottom' }: AdMobBannerProps) {
  useEffect(() => {
    // 네이티브 플랫폼(Android/iOS)에서만 광고 표시
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;

    const run = async () => {
      try {
        // 동적 import로 AdMob 모듈 로드 (웹에서는 로드 안 됨)
        const { initializeAdMob, showBannerAd, removeBannerAd } = await import('@/lib/admob');
        if (cancelled) return;

        await initializeAdMob();
        if (cancelled) return;

        // 보상형 광고로 받은 "광고 없는 시간"이면 배너를 내리고, 끝나는 시각에 다시 띄운다
        let showing = false;
        const sync = async () => {
          if (expiryTimer) clearTimeout(expiryTimer);
          expiryTimer = null;
          if (cancelled) return;

          const remaining = getAdFreeUntil() - Date.now();
          if (remaining > 0) {
            if (showing) {
              showing = false;
              await removeBannerAd();
            }
            expiryTimer = setTimeout(sync, remaining + 1000);
          } else if (!showing) {
            showing = true;
            await showBannerAd(position);
          }
        };

        unsubscribe = subscribeAdFree(() => { void sync(); });
        await sync();
      } catch (error) {
        console.error('AdMob initialization error:', error);
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (expiryTimer) clearTimeout(expiryTimer);
      unsubscribe?.();
      import('@/lib/admob')
        .then(({ removeBannerAd }) => removeBannerAd())
        .catch((error) => console.error('Failed to remove banner on unmount:', error));
    };
  }, [position]);

  // 웹에서는 AdSense 자동 광고 사용, 네이티브에서는 AdMob 네이티브 배너 사용
  // 둘 다 자동으로 처리되므로 별도 UI 불필요
  return null;
}
