'use client';

import { useRef, useState, useEffect } from 'react';
import { useViewer } from '@/lib/contexts/viewer-context';
import { ViewerToolbar } from '@/components/viewer-toolbar';

export function ViewerOverlay() {
  const { viewer, closeViewer } = useViewer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (viewer) setLoading(true);
  }, [viewer?.url]);

  // 미확인 차단 사이트 fallback: 10초 내 로드 없으면 외부 브라우저로
  useEffect(() => {
    if (!viewer) return;
    const t = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          window.open(viewer.url, '_blank', 'noopener,noreferrer');
          closeViewer();
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
        onBack={closeViewer}
      />

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src={viewer.url}
          onLoad={() => setLoading(false)}
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
