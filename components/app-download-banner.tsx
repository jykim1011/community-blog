'use client';

import { useState } from 'react';
import { useClientValue } from '@/lib/hooks/use-client-value';

const DISMISS_KEY = 'app-banner-dismissed';
const DISMISS_MS = 24 * 60 * 60 * 1000;

function shouldShowBanner(): boolean {
  // 모바일에서만 표시
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // 이미 앱에서 접속한 경우 숨김
  const isApp = window.matchMedia('(display-mode: standalone)').matches;
  // 이전에 닫은 적 있는지 확인 (24시간)
  let dismissedAt: string | null = null;
  try {
    dismissedAt = localStorage.getItem(DISMISS_KEY);
  } catch {
    // 저장소를 못 쓰면 닫은 적 없는 것으로
  }
  const isDismissedRecently = !!dismissedAt && Date.now() - parseInt(dismissedAt) < DISMISS_MS;
  return isMobile && !isApp && !isDismissedRecently;
}

export function AppDownloadBanner() {
  // 하이드레이션 뒤에 판단한다
  const isVisible = useClientValue(shouldShowBanner, false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()); } catch { /* 이번 실행 동안은 isDismissed 로 숨김 */ }
  };

  const handleDownload = () => {
    // Play Store 링크로 이동
    window.open('https://play.google.com/store/apps/details?id=com.communityblog.app', '_blank');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📱</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">통합 커뮤니티 앱</div>
            <div className="text-xs text-blue-100 truncate">
              더 빠르고 편리하게 이용하세요
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white text-blue-600 font-bold rounded-lg text-sm whitespace-nowrap hover:bg-blue-50 transition-colors"
          >
            설치
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-blue-600 rounded transition-colors"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
