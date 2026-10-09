'use client';

import { useEffect, useRef, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80; // 새로고침 트리거 거리
const MAX_PULL = 120;      // 최대 당기기 거리
const ACTIVATE_DY = 10;    // 이만큼은 아래로 끌어야 당기기로 인정 (탭/미세 흔들림 무시)

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 제스처 상태는 ref 로 둔다. state 를 이펙트 의존성에 넣으면 당기는 도중
  // 리스너가 재등록되면서 시작 좌표가 0 으로 초기화돼, 최상단에서 손가락이
  // 1px 만 내려가도 "수백 px 당김"으로 계산되어 새로고침이 터지던 버그가 있었다.
  const gesture = useRef({
    armed: false,       // 최상단에서 시작한 터치인지
    horizontal: false,  // 이번 터치가 가로 제스처로 확정됐는지
    startX: 0,
    startY: 0,
    distance: 0,
    refreshing: false,
  });
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const g = gesture.current;
    const atTop = () => (window.scrollY || document.documentElement.scrollTop) <= 0;

    const reset = () => {
      g.armed = false;
      g.distance = 0;
      setIsPulling(false);
      setPullDistance(0);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (g.refreshing || e.touches.length !== 1) { g.armed = false; return; }
      g.armed = atTop();
      g.horizontal = false;
      g.distance = 0;
      g.startX = e.touches[0].clientX;
      g.startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!g.armed || g.horizontal) return;
      if (!atTop()) { reset(); return; }

      const dy = e.touches[0].clientY - g.startY;
      const dx = Math.abs(e.touches[0].clientX - g.startX);

      // 수평 이동이 더 크면 이번 터치 전체를 수평 제스처로 확정 → pull 무시
      if (dx > Math.abs(dy)) {
        g.horizontal = true;
        if (g.distance > 0) reset();
        return;
      }

      if (dy < ACTIVATE_DY) {
        if (g.distance > 0) { g.distance = 0; setIsPulling(false); setPullDistance(0); }
        return;
      }

      // 저항감 추가 (거리가 멀수록 덜 당겨짐)
      const distance = Math.min((dy - ACTIVATE_DY) / 2.5, MAX_PULL);
      g.distance = distance;
      setIsPulling(true);
      setPullDistance(distance);
      if (distance > 20 && e.cancelable) e.preventDefault();
    };

    const handleTouchEnd = async () => {
      const shouldRefresh = g.armed && !g.horizontal && g.distance >= PULL_THRESHOLD;
      g.armed = false;
      g.distance = 0;
      setIsPulling(false);
      setPullDistance(0);
      if (!shouldRefresh) return;

      g.refreshing = true;
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      try {
        await onRefreshRef.current();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        g.refreshing = false;
        setIsRefreshing(false);
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', reset);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', reset);
    };
  }, []);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldRelease = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative" style={{ overscrollBehavior: 'contain' }}>
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
