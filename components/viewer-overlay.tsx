'use client';

import { useRef, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useViewer } from '@/lib/contexts/viewer-context';
import { ViewerToolbar } from '@/components/viewer-toolbar';

export function ViewerOverlay() {
  const { viewer, closeViewer, preloadUrl } = useViewer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const lastBackTimeRef = useRef(0);

  useEffect(() => {
    if (viewer) setLoading(true);
  }, [viewer?.url]);

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

  return (
    <div
      key={viewer.url}
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
      <ViewerToolbar
        siteName={viewer.site}
        siteColor={viewer.color}
        url={viewer.url}
        onBack={closeViewer}
      />

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <iframe
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
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--surface)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'var(--fg-3)', fontSize: 14 }}>불러오는 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
