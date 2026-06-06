'use client';

import { useState, useRef, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
import { useBookmarks } from '@/lib/hooks/use-bookmarks';
import { adStateManager } from '@/lib/ad-state';
import { isDomainBlocked } from '@/lib/utils/blocked-domains';
import { useViewer } from '@/lib/contexts/viewer-context';
import type { StaticPost } from '@/lib/types';

const SITE_THEME: Record<string, { color: string; badge: string; domain: string }> = {
  clien:      { color: '#475569', badge: '클',   domain: 'clien.net' },
  theqoo:     { color: '#d6006c', badge: '더',   domain: 'theqoo.net' },
  ruliweb:    { color: '#c81e1e', badge: '루',   domain: 'ruliweb.com' },
  dcinside:   { color: '#d1410c', badge: 'DC',   domain: 'dcinside.com' },
  fmkorea:    { color: '#d97706', badge: 'FM',   domain: 'fmkorea.com' },
  inven:      { color: '#b4530b', badge: '인',   domain: 'inven.co.kr' },
  arca:       { color: '#ea580c', badge: '아카', domain: 'arca.live' },
  ppomppu:    { color: '#a16207', badge: '뽐',   domain: 'ppomppu.co.kr' },
  mlbpark:    { color: '#0b3b5c', badge: 'MP',   domain: 'mlbpark.donga.com' },
  natepann:   { color: '#c92b2b', badge: '네',   domain: 'pann.nate.com' },
  instiz:     { color: '#7c3aed', badge: '인스', domain: 'instiz.net' },
  bobaedream: { color: '#1e3a8a', badge: '보',   domain: 'bobaedream.co.kr' },
  etoland:    { color: '#1f6b2a', badge: '에',   domain: 'etoland.co.kr' },
  humoruniv:  { color: '#1b4a9e', badge: '유',   domain: 'web.humoruniv.com' },
  cook82:     { color: '#b02727', badge: '82',   domain: '82cook.com' },
  slrclub:    { color: '#2d3a4a', badge: 'SLR',  domain: 'slrclub.com' },
  damoang:    { color: '#0f766e', badge: '다',   domain: 'damoang.com' },
  orbi:       { color: '#1d4ed8', badge: '오',   domain: 'orbi.kr' },
  gasengi:    { color: '#1e6b31', badge: '가',   domain: 'gasengi.com' },
  hygall:     { color: '#7a2a94', badge: '혜',   domain: 'gall.dcinside.com' },
  todayhumor: { color: '#5e6b10', badge: '투',   domain: 'todayhumor.co.kr' },
  quasarzone: { color: '#c2410c', badge: 'Q',    domain: 'quasarzone.com' },
  dealbada:   { color: '#854d0e', badge: '딜',   domain: 'dealbada.com' },
  dvdprime:   { color: '#4338ca', badge: 'DV',   domain: 'dvdprime.com' },
  coolenjoy:  { color: '#0f766e', badge: '쿨',   domain: 'coolenjoy.net' },
  extmovie:   { color: '#7e22ce', badge: 'EX',   domain: 'extmovie.com' },
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

function SiteIcon({ siteName, color, badge, size = 32, dim = false }: {
  siteName: string; color: string; badge: string; size?: number; dim?: boolean;
}) {
  const [error, setError] = useState(false);
  const domain = SITE_THEME[siteName]?.domain;
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

interface Props {
  posts: StaticPost[];
}

const PAGE_SIZE = 20;

function HotPostItem({ post, rank }: { post: StaticPost; rank: number }) {
  const { openViewer, preloadViewer, cancelPreload } = useViewer();
  const [time, setTime] = useState('');
  const { isRead, markAsRead, isLoaded } = useReadPosts();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setTime(formatRelativeTime(new Date(post.createdAt)));
    const t = setInterval(() => setTime(formatRelativeTime(new Date(post.createdAt))), 60000);
    return () => clearInterval(t);
  }, [post.createdAt]);

  const theme = SITE_THEME[post.site] ?? { color: '#71717a', badge: post.siteDisplayName.charAt(0), domain: '' };
  const isReadPost = isLoaded && isRead(post.url);
  const isHot = (post.commentCount ?? 0) >= 150 || (post.viewCount ?? 0) >= 20000;
  const bookmarked = isBookmarked(post.url);

  const hasViews    = post.viewCount != null;
  const hasComments = post.commentCount != null;
  const hasLikes    = post.likeCount != null && post.likeCount > 0;
  const hasStats    = hasViews || hasComments || hasLikes;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDomainBlocked(post.url)) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    preloadViewer(post.url);
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
    markAsRead(post.url);
    if (isDomainBlocked(post.url)) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
      return;
    }
    openViewer({ url: post.url, site: post.siteDisplayName, color: theme.color });
  };

  return (
    <a
      href={post.url}
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
            siteName={post.site}
            color={theme.color}
            badge={theme.badge}
            size={32}
            dim={isReadPost}
          />
        </div>

        {/* Right: content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Meta row: rank · site · category chip · time · HOT */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
            fontSize: 12, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden',
          }}>
            <span style={{
              fontWeight: 800, flexShrink: 0, tabularNums: true,
              color: rank <= 3 ? 'var(--accent)' : 'var(--fg-4)',
              fontSize: rank <= 3 ? 13 : 11,
            } as React.CSSProperties}>
              {rank}
            </span>
            <span style={{ color: 'var(--fg-4)', flexShrink: 0 }}>·</span>
            <span style={{
              fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
              color: isReadPost ? 'var(--fg-4)' : theme.color,
            }}>
              {post.siteDisplayName}
            </span>
            {post.category && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 11, fontWeight: 600, lineHeight: 1,
                padding: '2px 6px', borderRadius: 5, flexShrink: 0,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
              }}>
                {post.category}
              </span>
            )}
            <span style={{ color: 'var(--fg-4)', flexShrink: 0 }}>·</span>
            <span style={{ color: 'var(--fg-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {time || '방금 전'}
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
            {post.title}
          </h3>

          {/* Stats + bookmark */}
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
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>{fmtKo(post.viewCount!)}</span>
                  </span>
                )}
                {hasComments && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3.5,
                    color: isHot && !isReadPost ? 'var(--hot)' : undefined,
                    fontWeight: isHot && !isReadPost ? 600 : undefined,
                  }}>
                    <StatIcon paths={ICON_PATHS.chat} size={13} />
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>{fmtKo(post.commentCount!)}</span>
                  </span>
                )}
                {hasLikes && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5 }}>
                    <StatIcon paths={ICON_PATHS.heart} size={13} />
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>{fmtKo(post.likeCount!)}</span>
                  </span>
                )}
              </div>

              {/* Bookmark */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark(post.url, post.title, post.siteDisplayName);
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

export function HotPosts({ posts }: Props) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [isApp, setIsApp] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const loadRef = useRef<HTMLDivElement>(null);
  const hasMore = shown < posts.length;

  useEffect(() => {
    const isCapacitor =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'capacitor:' || (window as unknown as { Capacitor?: unknown }).Capacitor !== undefined);
    setIsApp(!!isCapacitor);
    return adStateManager.subscribe(setIsAdLoaded);
  }, []);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsLoading(true);
        setTimeout(() => {
          setShown(prev => Math.min(prev + PAGE_SIZE, posts.length));
          setIsLoading(false);
        }, 200);
      }
    }, { rootMargin: '200px' });
    if (loadRef.current) observer.observe(loadRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, posts.length]);

  const now = new Date();
  const timeStr = `${now.getHours() < 12 ? '오전' : '오후'} ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;

  const mobilePadBottom =
    isApp && isAdLoaded
      ? 'calc(120px + max(env(safe-area-inset-bottom), 0px))'
      : 'calc(72px + max(env(safe-area-inset-bottom), 0px))';

  return (
    <div
      className="max-w-3xl mx-auto px-4 pt-6 max-sm:pb-[var(--hot-mobile-pb)] sm:pb-10"
      style={{ ['--hot-mobile-pb' as string]: mobilePadBottom } as React.CSSProperties}
    >
      {/* 헤더 */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            🔥 지금 가장 뜨거운 글
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>
            조회수 · 댓글 · 좋아요를 종합한 실시간 인기 점수 TOP {posts.length}
          </p>
        </div>
        <span className="text-[11px] tabular-nums flex-shrink-0" style={{ color: 'var(--fg-4)' }}>
          {timeStr}
        </span>
      </div>

      {/* 포스트 리스트 */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {posts.slice(0, shown).map((post, i) => (
          <HotPostItem key={post.id} post={post} rank={i + 1} />
        ))}
      </div>

      {/* 무한 스크롤 */}
      {hasMore && (
        <div ref={loadRef} className="py-8 flex justify-center">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : <div className="h-4" />}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--fg-4)' }}>
          TOP {posts.length} 모두 확인했습니다
        </p>
      )}
    </div>
  );
}
