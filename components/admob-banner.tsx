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

  // 네이티브 플랫폼에서는 AdMob 네이티브 배너가 표시되므로
  // 웹에서만 플레이스홀더 표시
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  // 웹에서는 AdSense 또는 플레이스홀더 표시
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 py-2 ${position === 'top' ? 'border-b' : 'border-t'} border-gray-200 dark:border-gray-700`}>
      <div className="text-center text-xs text-gray-400 dark:text-gray-600">
        광고 영역 (웹 버전)
      </div>
    </div>
  );
}
