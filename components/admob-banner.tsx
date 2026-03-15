'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface AdMobBannerProps {
  position?: 'top' | 'bottom';
}

export function AdMobBanner({ position = 'bottom' }: AdMobBannerProps) {
  useEffect(() => {
    // 네이티브 플랫폼(Android/iOS)에서만 광고 표시
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;

    const initAd = async () => {
      try {
        // 동적 import로 AdMob 모듈 로드 (웹에서는 로드 안 됨)
        const { initializeAdMob, showBannerAd, removeBannerAd } = await import('@/lib/admob');

        if (!isMounted) return;

        // AdMob 초기화
        await initializeAdMob();

        if (!isMounted) return;

        // 배너 광고 표시
        await showBannerAd(position);

        // Cleanup
        return async () => {
          isMounted = false;
          try {
            await removeBannerAd();
          } catch (error) {
            console.error('Failed to remove banner on unmount:', error);
          }
        };
      } catch (error) {
        console.error('AdMob initialization error:', error);
      }
    };

    const cleanup = initAd();

    return () => {
      cleanup.then((cleanupFn) => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, [position]);

  // 웹에서는 AdSense 자동 광고 사용, 네이티브에서는 AdMob 네이티브 배너 사용
  // 둘 다 자동으로 처리되므로 별도 UI 불필요
  return null;
}
