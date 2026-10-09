'use client';

import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useViewer, type ViewerItem } from '@/lib/contexts/viewer-context';
import { adStateManager, AD_HEIGHT_NATIVE } from '@/lib/ad-state';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
import { faviconUrl } from '@/lib/site-theme';

function ItemIcon({ item, size }: { item: ViewerItem; size: number }) {
  const [error, setError] = useState(false);
  const src = item.siteName ? faviconUrl(item.siteName) : null;

  if (src && !error) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setError(true)}
        style={{ width: size, height: size, borderRadius: 6, objectFit: 'contain', flexShrink: 0 }}
        loading="lazy"
      />
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: item.color, color: '#fff',
      fontWeight: 800, fontSize: size * 0.42, lineHeight: 1,
    }}>
      {item.site.charAt(0)}
    </span>
  );
}

/**
 * 뷰어 안에서도 다른 커뮤니티 글이 계속 보이도록 하는 목록.
 * - 모바일: 하단 가로 스크롤 스트립
 * - 데스크톱: 우측 세로 목록
 */
export function ViewerQueueStrip({ layout }: { layout: 'bottom' | 'side' }) {
  const { queue, index, openViewer, viewer } = useViewer();
  const { isRead, markAsRead } = useReadPosts();
  // 뷰어는 사용자가 글을 눌렀을 때만 마운트되므로 초기값을 바로 읽어도 하이드레이션 문제 없음
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('viewer-strip-collapsed') === '1'; } catch { return false; }
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // 네이티브 앱의 AdMob 배너는 WebView 위에 그려지므로, 하단 스트립이 가려지지 않게 띄운다.
  const isNative = Capacitor.isNativePlatform();
  const [isAdLoaded, setIsAdLoaded] = useState(() => adStateManager.getAdLoaded());
  useEffect(() => adStateManager.subscribe(setIsAdLoaded), []);

  const toggle = () => {
    setCollapsed(prev => {
      try { localStorage.setItem('viewer-strip-collapsed', prev ? '0' : '1'); } catch { /* ignore */ }
      return !prev;
    });
  };

  // 현재 보고 있는 글이 바뀌면 목록에서 해당 항목으로 스크롤
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: layout === 'side' ? 'center' : 'nearest',
      inline: 'center',
    });
  }, [viewer?.url, layout]);

  if (queue.length === 0) return null;

  const handleSelect = (item: ViewerItem) => {
    if (item.url === viewer?.url) return;
    markAsRead(item.url);
    openViewer(item);
  };

  const isSide = layout === 'side';

  const header = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isSide ? '10px 12px' : '6px 12px 2px',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-2)' }}>
        이어서 보기
        {index >= 0 && (
          <span style={{ color: 'var(--fg-4)', fontWeight: 500, marginLeft: 6, fontVariantNumeric: 'tabular-nums' }}>
            {index + 1} / {queue.length}
          </span>
        )}
      </span>
      {!isSide && (
        <button
          onClick={toggle}
          aria-label={collapsed ? '목록 펼치기' : '목록 접기'}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 28, margin: '-4px -8px -4px 0',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)',
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform .2s ease' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );

  const items = queue.map((item) => {
    const active = item.url === viewer?.url;
    const read = !active && isRead(item.url);
    return (
      <button
        key={item.url}
        ref={active ? activeRef : undefined}
        onClick={() => handleSelect(item)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left',
          flexShrink: 0, cursor: 'pointer',
          width: isSide ? '100%' : 196,
          padding: isSide ? '9px 12px' : '8px 10px',
          ...(isSide
            ? { borderWidth: '0 0 0 3px', borderStyle: 'solid', borderColor: active ? item.color : 'transparent' }
            : { borderWidth: 1.5, borderStyle: 'solid', borderColor: active ? item.color : 'transparent' }),
          borderRadius: isSide ? 0 : 12,
          background: active ? 'var(--surface)' : isSide ? 'transparent' : 'var(--surface-2)',
        }}
      >
        <ItemIcon item={item} size={isSide ? 20 : 18} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontSize: 10.5, fontWeight: 700, marginBottom: 2,
            color: active ? item.color : 'var(--fg-4)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.site}
          </span>
          <span style={{
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', fontSize: 12.5, lineHeight: 1.35,
            fontWeight: active ? 700 : read ? 400 : 500,
            color: active ? 'var(--fg)' : read ? 'var(--fg-4)' : 'var(--fg-2)',
          } as React.CSSProperties}>
            {item.title || item.url}
          </span>
        </span>
      </button>
    );
  });

  if (isSide) {
    return (
      <aside style={{
        width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        {header}
        <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto' }}>
          {items}
        </div>
      </aside>
    );
  }

  return (
    <div style={{
      flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--surface)',
      paddingBottom: isNative && isAdLoaded
        ? `calc(${AD_HEIGHT_NATIVE}px + env(safe-area-inset-bottom, 0px))`
        : 'env(safe-area-inset-bottom, 0px)',
    }}>
      {header}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="scrollbar-hide"
          style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            padding: '4px 12px 10px', WebkitOverflowScrolling: 'touch',
          }}
        >
          {items}
        </div>
      )}
    </div>
  );
}
