'use client';

import { useRef, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useViewer } from '@/lib/contexts/viewer-context';
import { ViewerToolbar } from '@/components/viewer-toolbar';
import { ViewerQueueStrip } from '@/components/viewer-queue-strip';

const SIDE_LAYOUT_MIN_WIDTH = 900;

export function ViewerOverlay() {
  const { viewer, queue, index, closeViewer, goNext, goPrev, preloadUrl } = useViewer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [isWide, setIsWide] = useState(false);
  const lastBackTimeRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < queue.length - 1;

  // 글이 바뀌면 스피너를 렌더 중에 되돌린다.
  // 이펙트로 처리하면 paint 이후에 실행돼 빈 iframe 이 한 프레임 보인다.
  // 뷰어가 닫힐 때도 리셋해야 같은 글을 다시 열었을 때 스피너가 나온다.
  const currentUrl = viewer?.url ?? null;
  if (currentUrl !== renderedUrl) {
    setRenderedUrl(currentUrl);
    setLoading(currentUrl !== null);
  }

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${SIDE_LAYOUT_MIN_WIDTH}px)`);
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);


  // 네이티브 앱: iframe이 외부 URL 로드 시 AdMob 배너 재표시
  useEffect(() => {
    if (!viewer || !Capacitor.isNativePlatform()) return;
    import('@/lib/admob').then(({ resumeBannerAd }) => {
      resumeBannerAd().catch(() => {});
    });
  }, [viewer?.url]);

  // 네이티브 앱: 하드웨어 뒤로가기 처리 (MainActivity.java에서 이벤트 발송)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleNativeBack = () => {
      if (viewer) {
        closeViewer();
        return;
      }
      // 뷰어 없음: 2초 내 두 번 누르면 앱 종료
      const bridge = (window as unknown as { NativeBridge?: { exitApp: () => void; showExitToast: () => void } }).NativeBridge;
      const now = Date.now();
      if (now - lastBackTimeRef.current < 2000) {
        bridge?.exitApp();
      } else {
        lastBackTimeRef.current = now;
        bridge?.showExitToast();
      }
    };

    window.addEventListener('nativeBackButton', handleNativeBack);
    return () => window.removeEventListener('nativeBackButton', handleNativeBack);
  }, [viewer, closeViewer]);

  // 데스크톱 키보드 네비게이션
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewer, closeViewer, goNext, goPrev]);

  // 미확인 차단 사이트 fallback: 10초 내 로드 없으면 외부 브라우저로
  useEffect(() => {
    if (!viewer) return;
    const t = setTimeout(() => {
      setLoading(prev => {
        if (prev) window.open(viewer.url, '_blank', 'noopener,noreferrer');
        return prev;
      });
    }, 10000);
    return () => clearTimeout(t);
  }, [viewer?.url]);

  if (!viewer) {
    if (!preloadUrl) return null;
    return (
      <iframe
        src={preloadUrl}
        style={{ position: 'fixed', width: 0, height: 0, opacity: 0, border: 'none', pointerEvents: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
    );
  }

  // 툴바 영역 스와이프로 이전/다음 글 이동 (iframe 위에서는 제스처가 잡히지 않음)
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div
      className="viewer-page"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        zIndex: 50,
      }}
    >
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <ViewerToolbar
          siteName={viewer.site}
          siteKey={viewer.siteName}
          siteColor={viewer.color}
          url={viewer.url}
          title={viewer.title}
          onBack={closeViewer}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <iframe
            key={viewer.url}
            ref={iframeRef}
            src={viewer.url}
            onLoad={() => {
              setLoading(false);
              if (Capacitor.isNativePlatform()) {
                import('@/lib/admob').then(({ resumeBannerAd }) => {
                  resumeBannerAd().catch(() => {});
                });
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={viewer.site}
          />

          {loading && (
            <div
              aria-live="polite"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--surface)',
                zIndex: 1,
              }}
            >
              {/* 상단 진행 바 */}
              <div style={{ height: 2.5, overflow: 'hidden', background: 'var(--surface-2)' }}>
                <div style={{
                  width: '40%', height: '100%', background: viewer.color,
                  animation: 'viewer-progress 1.1s ease-in-out infinite',
                }} />
              </div>
              {/* 본문 스켈레톤 */}
              <div style={{ padding: '22px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: viewer.color, marginBottom: 10 }}>
                  {viewer.site}
                </div>
                <div style={{
                  fontSize: 19, fontWeight: 700, lineHeight: 1.4, color: 'var(--fg)',
                  letterSpacing: '-0.02em', marginBottom: 22,
                }}>
                  {viewer.title}
                </div>
                {[92, 100, 84, 96, 60].map((w, i) => (
                  <div key={i} className="animate-pulse" style={{
                    width: `${w}%`, height: 12, borderRadius: 6, marginBottom: 12,
                    background: 'var(--surface-2)',
                  }} />
                ))}
                <div className="animate-pulse" style={{
                  width: '100%', aspectRatio: '16 / 10', borderRadius: 12, marginTop: 8,
                  background: 'var(--surface-2)',
                }} />
              </div>
            </div>
          )}
        </div>

        {isWide && <ViewerQueueStrip layout="side" />}
      </div>

      {!isWide && <ViewerQueueStrip layout="bottom" />}
    </div>
  );
}
