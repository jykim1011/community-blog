'use client';

import { useState } from 'react';
import { faviconUrl } from '@/lib/site-theme';

interface ViewerToolbarProps {
  siteName: string;
  /** 사이트 키 (파비콘용) */
  siteKey?: string;
  siteColor: string;
  url: string;
  title?: string;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const GLYPHS = {
  back:     ['M19 12H5', 'M12 19l-7-7 7-7'],
  prev:     ['M15 18l-6-6 6-6'],
  next:     ['M9 18l6-6-6-6'],
  external: ['M15 3h6v6', 'M10 14L21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
};

function IconButton({
  label, paths, onClick, disabled, size = 22,
}: { label: string; paths: string[]; onClick?: () => void; disabled?: boolean; size?: number }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'none', border: 'none',
        color: 'var(--fg-1)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.25 : 1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, i) => <path key={i} d={d} />)}
      </svg>
    </button>
  );
}

function SiteFavicon({ siteKey, color }: { siteKey?: string; color: string }) {
  const [error, setError] = useState(false);
  const src = siteKey ? faviconUrl(siteKey) : null;
  if (src && !error) {
    return <img src={src} alt="" onError={() => setError(true)}
      style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0 }} />;
  }
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }} />;
}

export function ViewerToolbar({
  siteName, siteKey, siteColor, url, title, onBack, onPrev, onNext, hasPrev, hasNext,
}: ViewerToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 4,
        paddingRight: 4,
        minHeight: 52,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}
    >
      <IconButton label="목록으로" paths={GLYPHS.back} onClick={onBack} size={24} />

      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', padding: '0 4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontWeight: 600, fontSize: 12, lineHeight: 1.2, color: 'var(--fg-3)',
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          <SiteFavicon key={siteKey} siteKey={siteKey} color={siteColor} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{siteName}</span>
        </div>
        <div style={{
          marginTop: 2, fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, color: 'var(--fg)',
          letterSpacing: '-0.015em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title || (() => { try { return new URL(url).hostname; } catch { return url; } })()}
        </div>
      </div>

      <IconButton label="이전 글" paths={GLYPHS.prev} onClick={onPrev} disabled={!hasPrev} />
      <IconButton label="다음 글" paths={GLYPHS.next} onClick={onNext} disabled={!hasNext} />
      <IconButton
        label="브라우저로 열기"
        paths={GLYPHS.external}
        size={19}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      />
    </div>
  );
}
