'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { ViewerToolbar } from '@/components/viewer-toolbar';

type Status = 'loading' | 'loaded' | 'blocked';

// X-Frame-Options: SAMEORIGIN 또는 CSP frame-ancestors로 iframe을 차단하는 사이트
const BLOCKED_DOMAINS = new Set([
  'clien.net',
  'etoland.co.kr',
  'quasarzone.com',
]);

function isDomainBlocked(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return Array.from(BLOCKED_DOMAINS).some(
      d => hostname === d || hostname.endsWith('.' + d)
    );
  } catch {
    return false;
  }
}

export function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const url = searchParams.get('url') ?? '';
  const site = searchParams.get('site') ?? '';
  const color = searchParams.get('color') ?? '#71717a';

  const [status, setStatus] = useState<Status>(() =>
    isDomainBlocked(url) ? 'blocked' : 'loading'
  );

  useEffect(() => {
    if (!url) router.replace('/');
  }, [url, router]);

  // 알 수 없는 사이트에 대한 fallback: 10초 내 onLoad 없으면 차단으로 처리
  useEffect(() => {
    if (!url || status === 'blocked') return;
    const t = setTimeout(() => {
      setStatus(s => s === 'loading' ? 'blocked' : s);
    }, 10000);
    return () => clearTimeout(t);
  }, [url, status]);

  const handleLoad = () => setStatus('loaded');
  const handleError = () => setStatus('blocked');

  if (!url) return null;

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
      <ViewerToolbar
        siteName={site}
        siteColor={color}
        url={url}
        onBack={() => router.back()}
      />

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {status !== 'blocked' && (
          <iframe
            ref={iframeRef}
            src={url}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={site}
          />
        )}

        {status === 'loading' && (
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

        {status === 'blocked' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 40, marginBottom: 16 }}>🔒</span>
            <p style={{ fontWeight: 600, color: 'var(--fg)', marginBottom: 6, fontSize: 15 }}>
              이 사이트는 앱 내 표시를 차단하고 있어요
            </p>
            <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 24 }}>
              외부 브라우저에서 열어드릴게요
            </p>
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 22px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              브라우저에서 열기 ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
