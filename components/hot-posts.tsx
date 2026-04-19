'use client';

import { useState, useRef, useEffect } from 'react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { useReadPosts } from '@/lib/hooks/use-read-posts';
import { adStateManager } from '@/lib/ad-state';
import type { StaticPost } from '@/lib/types';

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

interface Props {
  posts: StaticPost[];
}

const PAGE_SIZE = 20;

function HotPostItem({ post, rank }: { post: StaticPost; rank: number }) {
  const [time, setTime] = useState('');
  const { isRead, markAsRead, isLoaded } = useReadPosts();

  useEffect(() => {
    setTime(formatRelativeTime(new Date(post.createdAt)));
    const t = setInterval(() => setTime(formatRelativeTime(new Date(post.createdAt))), 60000);
    return () => clearInterval(t);
  }, [post.createdAt]);

  const theme = SITE_THEME[post.site] || { color: '#71717a', domain: post.site };
  const isReadPost = isLoaded && isRead(post.url);
  const isTop3 = rank <= 3;

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => markAsRead(post.url)}
      className="flex items-stretch border-b last:border-b-0 cursor-pointer transition-colors"
      style={{ borderColor: 'var(--border)', backgroundColor: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* 순위 */}
      <div
        className="flex-shrink-0 flex items-center justify-center tabular-nums font-bold"
        style={{
          width: 36,
          borderRight: '1px solid var(--border)',
          color: isTop3 ? 'var(--accent)' : 'var(--fg-4)',
          fontSize: isTop3 ? 15 : 12,
        }}
      >
        {rank}
      </div>

      {/* 사이트 컬러 바 */}
      <div className="self-stretch flex-shrink-0" style={{ width: 3, background: theme.color }} />

      {/* 컨텐츠 */}
      <div className="flex-1 min-w-0 px-3 py-3">
        <div
          className="flex items-center gap-2 mb-1 text-xs overflow-hidden"
          style={{ color: 'var(--fg-3)', whiteSpace: 'nowrap' }}
        >
          <img
            src={`https://www.google.com/s2/favicons?domain=${theme.domain}&sz=32`}
            alt="" width={14} height={14}
            className="rounded-sm flex-shrink-0"
            loading="lazy"
          />
          <span className="font-semibold" style={{ color: theme.color }}>{post.siteDisplayName}</span>
          <span style={{ color: 'var(--fg-4)' }}>·</span>
          <span>{time || '방금 전'}</span>
          {post.viewCount != null && (
            <><span style={{ color: 'var(--fg-4)' }}>·</span><span>👁 {formatNumber(post.viewCount)}</span></>
          )}
          {post.commentCount != null && post.commentCount > 0 && (
            <><span style={{ color: 'var(--fg-4)' }}>·</span><span>💬 {post.commentCount}</span></>
          )}
        </div>

        <h3
          className="text-sm font-medium leading-snug line-clamp-2"
          style={{ color: isReadPost ? 'var(--fg-3)' : 'var(--fg)', margin: 0 }}
        >
          {post.category && (
            <span
              className="inline-block text-[10px] font-medium mr-1.5 px-1.5 py-0.5 rounded align-middle"
              style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
            >
              {post.category}
            </span>
          )}
          {post.title}
        </h3>

        {post.likeCount != null && post.likeCount > 0 && (
          <div className="mt-1 text-xs" style={{ color: 'var(--fg-4)' }}>
            ❤️ {formatNumber(post.likeCount)}
          </div>
        )}
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
