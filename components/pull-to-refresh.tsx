'use client';

import { useEffect, useRef, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80; // 새로고침 트리거 거리
  const MAX_PULL = 120; // 최대 당기기 거리

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let scrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // 페이지가 최상단일 때만 작동
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop === 0) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || scrollTop !== 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY;

      // 아래로 당길 때만 작동
      if (distance > 0 && scrollTop === 0) {
        setIsPulling(true);
        // 저항감 추가 (거리가 멀수록 덜 당겨짐)
        const resistance = Math.min(distance / 2.5, MAX_PULL);
        setPullDistance(resistance);

        // 너무 많이 당기지 못하도록 제한
        if (resistance > 20) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, onRefresh, pullDistance]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldRelease = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-Refresh 인디케이터 */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: isPulling || isRefreshing ? pullDistance : 0,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2 pb-2">
          {/* 스피너 아이콘 */}
          <div
            className={`w-8 h-8 border-3 border-gray-300 dark:border-gray-600 border-t-violet-600 dark:border-t-violet-400 rounded-full transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing
                ? 'rotate(0deg)'
                : `rotate(${progress * 360}deg)`,
            }}
          />

          {/* 텍스트 */}
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {isRefreshing
              ? '새로고침 중...'
              : shouldRelease
              ? '손을 떼서 새로고침'
              : '당겨서 새로고침'}
          </p>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: isPulling || isRefreshing ? `translateY(${pullDistance}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
