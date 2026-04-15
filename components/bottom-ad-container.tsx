'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { adStateManager } from '@/lib/ad-state';

/**
 * 하단 고정 광고 컨테이너 (웹 전용)
 * 모바일 웹에서 네비게이션 바로 위에 AdSense 광고 표시
 */
export function BottomAdContainer() {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // 네이티브 플랫폼인지 확인
    setIsNative(Capacitor.isNativePlatform());

    // 광고 로드 상태 구독 (웹용 AdSense 광고)
    const unsubscribe = adStateManager.subscribe(setIsAdLoaded);

    // 웹에서 AdSense 광고 로드 확인 (간단한 타이머)
    const timer = setTimeout(() => {
      if (!Capacitor.isNativePlatform()) {
        // 웹에서는 AdSense 자동 광고 사용 중이므로 기본적으로 로드된 것으로 간주
        adStateManager.setAdLoaded(true);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 네이티브 앱에서는 표시하지 않음 (AdMob이 네이티브 레벨에서 처리)
  if (isNative) {
    return null;
  }

  // 광고가 로드되지 않았으면 표시하지 않음 (빈 공간 방지)
  if (!isAdLoaded) {
    return null;
  }

  return (
    <div
      className="sm:hidden fixed left-0 right-0 z-40 bg-white dark:bg-gray-800"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom))', // 네비게이션 바 높이
      }}
    >
      {/* AdSense 광고 영역 */}
      <div className="w-full flex items-center justify-center py-2 min-h-[60px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '50px' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot="1234567890" // TODO: 실제 광고 슬롯 ID로 교체
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
