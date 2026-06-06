'use client';

import { useState, useEffect, useRef } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
import { useBookmarks } from '@/lib/hooks/use-bookmarks';
import { isDomainBlocked } from '@/lib/utils/blocked-domains';
import { useViewer } from '@/lib/contexts/viewer-context';
interface PostCardProps {
  id: string;
  title: string;
  author: string;
  url: string;
  site: { displayName: string; name: string };
  viewCount?: number | null;
  commentCount?: number | null;
  likeCount?: number | null;
  createdAt: Date;
  category?: string;
}

const SITE_THEME: Record<string, { color: string; badge: string }> = {
  clien:      { color: '#475569', badge: '클' },
  theqoo:     { color: '#d6006c', badge: '더' },
  ruliweb:    { color: '#c81e1e', badge: '루' },
  dcinside:   { color: '#d1410c', badge: 'DC' },
  fmkorea:    { color: '#d97706', badge: 'FM' },
  inven:      { color: '#b4530b', badge: '인' },
  arca:       { color: '#ea580c', badge: '아카' },
  ppomppu:    { color: '#a16207', badge: '뽐' },
  mlbpark:    { color: '#0b3b5c', badge: 'MP' },
  natepann:   { color: '#c92b2b', badge: '네' },
  instiz:     { color: '#7c3aed', badge: '인스' },
  bobaedream: { color: '#1e3a8a', badge: '보' },
  etoland:    { color: '#1f6b2a', badge: '에' },
  humoruniv:  { color: '#1b4a9e', badge: '유' },
  cook82:     { color: '#b02727', badge: '82' },
  slrclub:    { color: '#2d3a4a', badge: 'SLR' },
  damoang:    { color: '#0f766e', badge: '다' },
  orbi:       { color: '#1d4ed8', badge: '오' },
  gasengi:    { color: '#1e6b31', badge: '가' },
  hygall:     { color: '#7a2a94', badge: '혜' },
  todayhumor: { color: '#5e6b10', badge: '투' },
  quasarzone: { color: '#c2410c', badge: 'Q' },
  dealbada:   { color: '#854d0e', badge: '딜' },
  dvdprime:   { color: '#4338ca', badge: 'DV' },
  coolenjoy:  { color: '#0f766e', badge: '쿨' },
  extmovie:   { color: '#7e22ce', badge: 'EX' },
};

const SITE_DOMAIN: Record<string, string> = {
  clien:      'clien.net',
  theqoo:     'theqoo.net',
  ruliweb:    'ruliweb.com',
  dcinside:   'dcinside.com',
  fmkorea:    'fmkorea.com',
  inven:      'inven.co.kr',
  arca:       'arca.live',
  ppomppu:    'ppomppu.co.kr',
  mlbpark:    'mlbpark.donga.com',
  natepann:   'pann.nate.com',
  instiz:     'instiz.net',
  bobaedream: 'bobaedream.co.kr',
  etoland:    'etoland.co.kr',
  humoruniv:  'web.humoruniv.com',
  cook82:     '82cook.com',
  slrclub:    'slrclub.com',
  damoang:    'damoang.com',
  orbi:       'orbi.kr',
  gasengi:    'gasengi.com',
  hygall:     'gall.dcinside.com',
  todayhumor: 'todayhumor.co.kr',
  quasarzone: 'quasarzone.com',
  dealbada:   'dealbada.com',
  dvdprime:   'dvdprime.com',
  coolenjoy:  'coolenjoy.net',
  extmovie:   'extmovie.com',
};

const ICON_PATHS = {
  eye:      ['M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  chat:     ['M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'],
  heart:    ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.6z'],
  bookmark: ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
};

function StatIcon({ paths, size = 13 }: { paths: string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

function fmtKo(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1) + '만';
  if (n >= 1000) return n.toLocaleString('ko-KR');
  return String(n);
}

function SiteIcon({ siteName, color, badge, size = 32, dim = false }: { siteName: string; color: string; badge: string; size?: number; dim?: boolean }) {
  const [error, setError] = useState(false);
  const domain = SITE_DOMAIN[siteName];
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  if (faviconUrl && !error) {
    return (
      <img
        src={faviconUrl}
        alt=""
        onError={() => setError(true)}
        style={{
          width: size, height: size, flexShrink: 0,
          borderRadius: 8, objectFit: 'contain',
          opacity: dim ? 0.4 : 1,
        }}
        loading="lazy"
      />
    );
  }

  const len = badge.length;
  const fs = size * 0.42 * (len > 2 ? 0.62 : len > 1 ? 0.82 : 1);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, width: size, height: size, borderRadius: 9,
      background: dim ? 'var(--fg-4)' : color, color: '#fff',
      fontWeight: 800, fontSize: fs, letterSpacing: '-0.04em', lineHeight: 1,
    }}>
      {badge}
    </span>
  );
}

export function PostCard({
  title, url, site, viewCount, commentCount, likeCount, createdAt, category,
}: PostCardProps) {
  const { openViewer, preloadViewer, cancelPreload } = useViewer();
  const [relativeTime, setRelativeTime] = useState('');
  const { isRead, markAsRead, isLoaded } = useReadPosts();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setRelativeTime(formatRelativeTime(new Date(createdAt)));
    const t = setInterval(() => setRelativeTime(formatRelativeTime(new Date(createdAt))), 60000);
    return () => clearInterval(t);
  }, [createdAt]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDomainBlocked(url)) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    preloadViewer(url);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    if (dx * dx + dy * dy > 25) {
      cancelPreload();
      touchStartPos.current = null;
    }
  };

  const handleTouchCancel = () => {
    cancelPreload();
    touchStartPos.current = null;
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    markAsRead(url);
    if (isDomainBlocked(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    openViewer({ url, site: site.displayName, color: SITE_THEME[site.name]?.color ?? '#71717a' });
  };

  const isReadPost = isLoaded && isRead(url);
  const theme = SITE_THEME[site.name] ?? { color: '#71717a', badge: site.displayName.charAt(0) };
  const isHot = (commentCount ?? 0) >= 150 || (viewCount ?? 0) >= 20000;
  const bookmarked = isBookmarked(url);

  const hasViews    = viewCount != null;
  const hasComments = commentCount != null;
  const hasLikes    = likeCount != null && likeCount > 0;
  const hasStats    = hasViews || hasComments || hasLikes;

  return (
    <a
      href={url}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === ' ') handleClick(e); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
      className="block transition-colors cursor-pointer"
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: isReadPost ? 'var(--surface-2)' : 'transparent',
      }}
      onMouseEnter={e => { if (!isReadPost) e.currentTarget.style.backgroundColor = 'var(--hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = isReadPost ? 'var(--surface-2)' : 'transparent'; }}
    >
      <div style={{ display: 'flex', gap: 12, padding: '15px 18px', alignItems: 'flex-start' }}>

        {/* Left: site icon */}
        <div style={{ paddingTop: 1, flexShrink: 0 }}>
          <SiteIcon
            siteName={site.name}
            color={theme.color}
            badge={theme.badge}
            size={32}
            dim={isReadPost}
          />
        </div>

        {/* Right: content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Meta row: site · category chip · time · HOT */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
            fontSize: 12, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden',
          }}>
            <span style={{
              fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
              color: isReadPost ? 'var(--fg-4)' : theme.color,
            }}>
              {site.displayName}
            </span>
            {category && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 11, fontWeight: 600, lineHeight: 1,
                padding: '2px 6px', borderRadius: 5, flexShrink: 0,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
              }}>
                {category}
              </span>
            )}
            <span style={{ color: 'var(--fg-4)', flexShrink: 0 }}>·</span>
            <span style={{ color: 'var(--fg-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {relativeTime || '방금 전'}
            </span>
            {isHot && !isReadPost && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                color: 'var(--hot)', fontWeight: 700, fontSize: 11,
                flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                🔥 HOT
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              margin: 0,
              fontSize: 15.5,
              fontWeight: isReadPost ? 400 : 600,
              lineHeight: 1.42,
              color: isReadPost ? 'var(--fg-3)' : 'var(--fg)',
              letterSpacing: '-0.015em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}
          >
            {title}
          </h3>

          {/* Stats + bookmark button */}
          {hasStats && (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginTop: 9,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 11,
                fontSize: 12, color: isReadPost ? 'var(--fg-4)' : 'var(--fg-3)',
              }}>
                {hasViews && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5 }}>
                    <StatIcon paths={ICON_PATHS.eye} size={13} />
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>{fmtKo(viewCount!)}</span>
                  </span>
                )}
                {hasComments && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3.5,
                    color: isHot && !isReadPost ? 'var(--hot)' : undefined,
                    fontWeight: isHot && !isReadPost ? 600 : undefined,
                  }}>
                    <StatIcon paths={ICON_PATHS.chat} size={13} />
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>{fmtKo(commentCount!)}</span>
                  </span>
                )}
                {hasLikes && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5 }}>
                    <StatIcon paths={ICON_PATHS.heart} size={13} />
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>{fmtKo(likeCount!)}</span>
                  </span>
                )}
              </div>

              {/* Bookmark */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark(url, title, site.displayName);
                }}
                style={{
                  background: 'none', border: 'none', padding: '3px 4px',
                  margin: '-3px -4px', display: 'inline-flex', cursor: 'pointer',
                  color: bookmarked ? 'var(--accent)' : 'var(--fg-4)',
                  flexShrink: 0,
                }}
                aria-label={bookmarked ? '북마크 제거' : '북마크 저장'}
              >
                <svg width={15} height={15} viewBox="0 0 24 24"
                  fill={bookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICON_PATHS.bookmark[0]} />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
