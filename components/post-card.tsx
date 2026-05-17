'use client';

import { useState, useEffect, useRef } from 'react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
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
  thumbnail?: string;
  category?: string;
}

const SITE_THEME: Record<string, { color: string; domain: string }> = {
  clien:      { color: '#475569', domain: 'clien.net' },
  theqoo:     { color: '#d6006c', domain: 'theqoo.net' },
  ruliweb:    { color: '#c81e1e', domain: 'ruliweb.com' },
  dcinside:   { color: '#d1410c', domain: 'dcinside.com' },
  inven:      { color: '#b4530b', domain: 'inven.co.kr' },
  ppomppu:    { color: '#a16207', domain: 'ppomppu.co.kr' },
  mlbpark:    { color: '#0b3b5c', domain: 'mlbpark.donga.com' },
  natepann:   { color: '#c92b2b', domain: 'pann.nate.com' },
  ilbe:       { color: '#455a64', domain: 'ilbe.com' },
  bobaedream: { color: '#1e3a8a', domain: 'bobaedream.co.kr' },
  etoland:    { color: '#1f6b2a', domain: 'etoland.co.kr' },
  humoruniv:  { color: '#1b4a9e', domain: 'web.humoruniv.com' },
  cook82:     { color: '#b02727', domain: '82cook.com' },
  slrclub:    { color: '#2d3a4a', domain: 'slrclub.com' },
  gasengi:    { color: '#1e6b31', domain: 'gasengi.com' },
  hygall:     { color: '#7a2a94', domain: 'gall.dcinside.com' },
  todayhumor: { color: '#5e6b10', domain: 'todayhumor.co.kr' },
  quasarzone: { color: '#c2410c', domain: 'quasarzone.com' },
  dealbada:   { color: '#854d0e', domain: 'dealbada.com' },
  dvdprime:   { color: '#4338ca', domain: 'dvdprime.com' },
  coolenjoy:  { color: '#0f766e', domain: 'coolenjoy.net' },
  extmovie:   { color: '#7e22ce', domain: 'extmovie.com' },
};

export function PostCard({ title, author, url, site, viewCount, commentCount, likeCount, createdAt, category }: PostCardProps) {
  const { openViewer, preloadViewer, cancelPreload } = useViewer();
  const [relativeTime, setRelativeTime] = useState('');
  const { isRead, markAsRead, isLoaded } = useReadPosts();
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setRelativeTime(formatRelativeTime(new Date(createdAt)));
    const t = setInterval(() => setRelativeTime(formatRelativeTime(new Date(createdAt))), 60000);
    return () => clearInterval(t);
  }, [createdAt]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDomainBlocked(url)) return;
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
    preloadViewer(url);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;
    const dy = t.clientY - touchStartPos.current.y;
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
  const theme = SITE_THEME[site.name] || { color: '#71717a', domain: site.name };

  return (
    <a
      href={url}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === ' ') handleClick(e); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
      className="grid gap-3 px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer"
      style={{
        gridTemplateColumns: '3px 1fr',
        borderColor: 'var(--border)',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* left color bar */}
      <div className="self-stretch rounded-sm" style={{ background: theme.color, width: 3, minHeight: 20 }} />

      {/* content */}
      <div className="min-w-0">
        {/* meta row */}
        <div className="flex items-center gap-2 mb-1 text-xs overflow-hidden" style={{ color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${theme.domain}&sz=32`}
            alt=""
            width={14} height={14}
            className="rounded-sm flex-shrink-0"
            loading="lazy"
          />
          <span className="font-semibold" style={{ color: theme.color }}>{site.displayName}</span>
          <span style={{ color: 'var(--fg-4)' }}>·</span>
          <span>{relativeTime || '방금 전'}</span>
          {viewCount != null && (
            <>
              <span style={{ color: 'var(--fg-4)' }}>·</span>
              <span>👁 {formatNumber(viewCount)}</span>
            </>
          )}
          {commentCount != null && commentCount > 0 && (
            <>
              <span style={{ color: 'var(--fg-4)' }}>·</span>
              <span>💬 {commentCount}</span>
            </>
          )}
        </div>

        {/* title */}
        <h3
          className="text-sm font-medium leading-snug line-clamp-2"
          style={{ color: isReadPost ? 'var(--fg-3)' : 'var(--fg)', margin: 0 }}
        >
          {category && (
            <span
              className="inline-block text-[10px] font-medium mr-1.5 px-1.5 py-0.5 rounded align-middle"
              style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
            >
              {category}
            </span>
          )}
          {title}
        </h3>

        {/* bottom stats (likes) */}
        {likeCount != null && likeCount > 0 && (
          <div className="mt-1 text-xs" style={{ color: 'var(--fg-4)' }}>
            ❤️ {formatNumber(likeCount)}
          </div>
        )}
      </div>
    </a>
  );
}
