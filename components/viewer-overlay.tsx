'use client';

import { useRef, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useViewer } from '@/lib/contexts/viewer-context';
import { ViewerToolbar } from '@/components/viewer-toolbar';

export function ViewerOverlay() {
  const { viewer, closeViewer } = useViewer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  // 네이티브 앱: 초기 가드 항목 추가 → canGoBack()이 항상 true여서 첫 뒤로가기도 앱 종료 대신 popstate 발생
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      history.pushState({ guard: true }, '');
    }
  }, []);

  // 뷰어 열릴 때 가짜 히스토리 항목 추가 → 하드웨어 뒤로가기가 이 항목을 pop
  useEffect(() => {
    if (viewer) {
      setLoading(true);
      history.pushState({ viewer: true }, '');
    }
  }, [viewer?.url]);

  // 네이티브 앱: iframe이 외부 URL 로드 시 AdMob 배너가 hide될 수 있으므로 뷰어가 열릴 때 재표시
  useEffect(() => {
    if (!viewer || !Capacitor.isNativePlatform()) return;
    import('@/lib/admob').then(({ resumeBannerAd }) => {
      resumeBannerAd().catch(() => {});
    });
  }, [viewer?.url]);

  // popstate = 하드웨어 뒤로가기 or history.back() 호출
  useEffect(() => {
    const handlePopState = () => {
      if (viewer) {
        closeViewer();
      } else if (Capacitor.isNativePlatform()) {
        // 뷰어 없는 상태에서 뒤로가기: 가드 항목 재추가 → 앱 종료 방지
        history.pushState({ guard: true }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewer, closeViewer]);

  // 미확인 차단 사이트 fallback: 10초 내 로드 없으면 외부 브라우저로
  useEffect(() => {
    if (!viewer) return;
    const t = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          window.open(viewer.url, '_blank', 'noopener,noreferrer');
          history.back();
        }
        return prev;
      });
    }, 10000);
    return () => clearTimeout(t);
  }, [viewer?.url]);

  if (!viewer) return null;

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
        onBack={() => history.back()}
      />

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src={viewer.url}
          onLoad={() => {
            setLoading(false);
            // iframe이 외부 URL 로드 완료 후 AdMob 배너 재표시
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
