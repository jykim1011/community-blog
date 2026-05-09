'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PostList } from '@/components/post-list';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { adStateManager } from '@/lib/ad-state';
import { SITE_NAME } from '@/lib/constants';
import type { StaticPost, StaticSite } from '@/lib/types';

interface Props {
  initialPosts: StaticPost[];
  initialSites: StaticSite[];
}

const SITE_COLORS: Record<string, string> = {
  clien: '#475569', theqoo: '#d6006c', ruliweb: '#c81e1e', dcinside: '#d1410c',
  inven: '#b4530b', ppomppu: '#a16207', mlbpark: '#0b3b5c', natepann: '#c92b2b',
  ilbe: '#455a64', bobaedream: '#1e3a8a', etoland: '#1f6b2a', humoruniv: '#1b4a9e',
  cook82: '#b02727', slrclub: '#2d3a4a', gasengi: '#1e6b31', hygall: '#7a2a94',
  todayhumor: '#5e6b10', quasarzone: '#c2410c', dealbada: '#854d0e',
  dvdprime: '#4338ca', coolenjoy: '#0f766e', extmovie: '#7e22ce',
};

// ── Icon components ──────────────────────────────────────────
function Icon({ d, size = 18 }: { d: string | string[]; size?: number }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICONS = {
  home:     ['M3 10.5L12 3l9 7.5', 'M5 9.5V21h14V9.5'],
  trend:    ['M3 17l6-6 4 4 8-8', 'M14 7h7v7'],
  hot:      ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  settings: ['M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2', 'M12 8v4', 'M12 16h.01'],
  guide:    ['M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'],
  search:   ['M21 21l-4.35-4.35', 'M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0'],
  bell:     ['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0'],
};

// ── Rail (desktop icon column) ────────────────────────────────
function Rail({ pathname }: { pathname: string }) {
  const router = useRouter();
  const navItems = [
    { href: '/', icon: ICONS.home, label: '홈' },
    { href: '/trends', icon: ICONS.trend, label: '트렌드' },
    { href: '/hot', icon: ICONS.hot, label: '인기글' },
    { href: '/settings', icon: ICONS.settings, label: '설정' },
    { href: '/communities', icon: ICONS.guide, label: '가이드' },
  ];
  return (
    <aside
      className="flex-shrink-0 flex flex-col items-center gap-1 py-3 px-2"
      style={{
        width: 'var(--rail-w)', background: 'var(--surface)',
        borderRight: '1px solid var(--border)', position: 'sticky',
        top: 0, height: '100vh', zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-black text-base mb-2 cursor-pointer"
        style={{ background: 'var(--accent)', letterSpacing: '-0.04em' }}
        onClick={() => router.push('/')}
        title={SITE_NAME}
      >
        통
      </div>

      {navItems.map(item => {
        const isActive = pathname === item.href;
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            title={item.label}
            className="flex items-center justify-center w-11 h-11 rounded-xl border-0 cursor-pointer transition-colors relative"
            style={{
              background: isActive ? 'var(--accent-tint)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--fg-3)',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--fg-1)'; }}}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-3)'; }}}
          >
            {isActive && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r" style={{ background: 'var(--accent)', left: -8 }} />
            )}
            <Icon d={item.icon} size={18} />
          </button>
        );
      })}
    </aside>
  );
}

// ── Sidebar (desktop community list) ─────────────────────────
function Sidebar({ sites, posts, activeSite, onSiteClick }: {
  sites: StaticSite[];
  posts: StaticPost[];
  activeSite: string | null;
  onSiteClick: (site: string | null) => void;
}) {
  const router = useRouter();
  const postCounts = useMemo(() => {
    const m: Record<string, number> = {};
    posts.forEach(p => { m[p.site] = (m[p.site] || 0) + 1; });
    return m;
  }, [posts]);

  const categories = useMemo(() => {
    const cats: Record<string, StaticSite[]> = {};
    sites.forEach(s => {
      const cat = s.category || 'community';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s);
    });
    return cats;
  }, [sites]);

  const catLabels: Record<string, string> = { community: '커뮤니티', hotdeal: '핫딜', movie: '영화', game: '게임' };

  return (
    <aside
      className="flex-shrink-0 flex flex-col gap-4 py-4 overflow-y-auto"
      style={{
        width: 'var(--sidebar-w)', background: 'var(--surface)',
        borderRight: '1px solid var(--border)', position: 'sticky',
        top: 0, height: '100vh', scrollbarWidth: 'none',
      }}
    >
      {/* All feed */}
      <div>
        <p className="px-5 mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>내 피드</p>
        <div className="flex flex-col gap-0.5 px-3">
          {[
            { key: null, label: '전체 커뮤니티', count: posts.length, color: 'var(--accent)' },
            { key: 'hot', label: '🔥 실시간 인기', count: posts.filter(p => (p.viewCount || 0) > 5000 || (p.commentCount || 0) > 100).length, color: '#ef4444' },
          ].map(item => (
            <button
              key={item.key || 'all'}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left border-0 cursor-pointer transition-colors"
              style={{
                background: activeSite === item.key ? 'var(--accent-tint)' : 'transparent',
                color: activeSite === item.key ? 'var(--accent)' : 'var(--fg-2)',
                fontWeight: activeSite === item.key ? 600 : 400,
                fontSize: 13,
              }}
              onMouseEnter={e => { if (activeSite !== item.key) e.currentTarget.style.background = 'var(--hover)'; }}
              onMouseLeave={e => { if (activeSite !== item.key) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => item.key === 'hot' ? router.push('/hot') : onSiteClick(item.key)}
            >
              <span className="w-2 h-2 rounded flex-shrink-0" style={{ background: item.color }} />
              <span className="flex-1 min-w-0 truncate">{item.label}</span>
              <span className="text-[11px] font-mono tabular-nums" style={{ color: activeSite === item.key ? 'var(--accent)' : 'var(--fg-3)' }}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {Object.entries(categories).map(([cat, catSites]) => (
        <div key={cat}>
          <p className="px-5 mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>
            {catLabels[cat] || cat}
          </p>
          <div className="flex flex-col gap-0.5 px-3">
            {catSites.map(s => {
              const isActive = activeSite === s.name;
              const color = SITE_COLORS[s.name] || '#71717a';
              return (
                <button
                  key={s.name}
                  className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left border-0 cursor-pointer transition-colors"
                  style={{
                    background: isActive ? 'var(--accent-tint)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--fg-2)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => onSiteClick(isActive ? null : s.name)}
                >
                  <span className="w-2 h-2 rounded flex-shrink-0" style={{ background: color }} />
                  <span className="flex-1 min-w-0 truncate">{s.displayName}</span>
                  <span className="text-[11px] font-mono tabular-nums" style={{ color: isActive ? 'var(--accent)' : 'var(--fg-3)' }}>
                    {postCounts[s.name] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-auto px-5 pt-3 flex items-center gap-2 text-[11px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-3)' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--pos)' }} />
        크롤러 가동 중 · 30분마다 갱신
      </div>
    </aside>
  );
}

// ── Stats bar ─────────────────────────────────────────────────
function StatsBar({ posts }: { posts: StaticPost[] }) {
  const stats = useMemo(() => ({
    posts: posts.length,
    comments: posts.reduce((a, p) => a + (p.commentCount || 0), 0),
    views: posts.reduce((a, p) => a + (p.viewCount || 0), 0),
    sites: new Set(posts.map(p => p.site)).size,
  }), [posts]);

  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  const items = [
    { emoji: '📰', label: '게시글', value: fmt(stats.posts) },
    { emoji: '💬', label: '총 댓글', value: fmt(stats.comments) },
    { emoji: '👁', label: '총 조회', value: fmt(stats.views) },
    { emoji: '🏠', label: '커뮤니티', value: String(stats.sites) },
  ];

  return (
    <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {items.map(item => (
        <div
          key={item.label}
          className="rounded-xl px-4 py-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--fg-3)' }}>
            <span>{item.emoji}</span> {item.label}
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Top bar (inside main) ──────────────────────────────────────
function TopBar({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-3 sticky top-0 z-10"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold tracking-tight truncate" style={{ color: 'var(--fg)', margin: 0, letterSpacing: '-0.015em' }}>
            {title}
            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded align-middle" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
              LIVE
            </span>
          </h1>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>{sub}</p>
      </div>
      <div className="relative flex-shrink-0" style={{ width: 280 }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-3)' }}>
          <Icon d={ICONS.search} size={13} />
        </span>
        <input
          className="w-full py-2 pl-8 pr-3 text-sm rounded-lg outline-none transition-colors"
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--fg-1)', fontSize: 13,
          }}
          placeholder="키워드 · 커뮤니티 검색…"
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
    </div>
  );
}

// ── Mobile bottom nav ──────────────────────────────────────────
function MobileNav({ pathname, isApp, isAdLoaded }: { pathname: string; isApp: boolean; isAdLoaded: boolean }) {
  const router = useRouter();
  const items = [
    { href: '/', label: '홈', icon: ICONS.home },
    { href: '/hot', label: '인기글', icon: ICONS.hot },
    { href: '/settings', label: '설정', icon: ICONS.settings },
  ];
  return (
    <nav
      className="sm:hidden fixed left-0 right-0 flex items-center justify-around z-50"
      style={{
        bottom: isApp && isAdLoaded
          ? 'calc(60px + max(env(safe-area-inset-bottom), 0px))'
          : '0',
        height: 56,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: isApp && isAdLoaded ? '0' : 'max(env(safe-area-inset-bottom), 0px)',
      }}
    >
      {items.map(item => {
        const isActive = pathname === item.href;
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 border-0 bg-transparent cursor-pointer transition-colors"
            style={{ color: isActive ? 'var(--accent)' : 'var(--fg-3)' }}
          >
            <Icon d={item.icon} size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Main DashboardHome ─────────────────────────────────────────
export function DashboardHome({ initialPosts, initialSites }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { subscriptions, isLoaded } = useSubscriptions();
  const [displayPosts, setDisplayPosts] = useState<StaticPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [isApp, setIsApp] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [activeSite, setActiveSite] = useState<string | null>(null);

  useEffect(() => {
    const isCapacitor = typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' || (window as any).Capacitor !== undefined
    );
    setIsApp(isCapacitor);
    const unsub = adStateManager.subscribe(setIsAdLoaded);
    return unsub;
  }, []);

  const filteredSites = useMemo(() =>
    subscriptions.length > 0 ? initialSites.filter(s => subscriptions.includes(s.name)) : initialSites,
    [subscriptions, initialSites]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (subscriptions.length > 0) {
      setLoading(true);
      Promise.all(
        subscriptions.map(async name => {
          try {
            const d = await import(`@/data/sites/${name}.json`);
            return (d.default?.posts || d.posts || []) as StaticPost[];
          } catch { return []; }
        })
      ).then(results => {
        const posts = results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDisplayPosts(posts);
      }).catch(() => setDisplayPosts(initialPosts)).finally(() => setLoading(false));
    } else {
      setDisplayPosts(initialPosts);
    }
  }, [subscriptions, isLoaded, initialPosts]);

  const now = new Date();
  const timeStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${now.getHours() < 12 ? '오전' : '오후'} ${String(now.getHours() % 12 || 12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const subtitle = `${new Set(displayPosts.map(p => p.site)).size}개 커뮤니티 · 방금 갱신됨 · ${timeStr}`;

  // ── Loading state ──
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--fg-3)' }}>커뮤니티 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Desktop: 3-column dashboard */}
      <div className="hidden sm:flex" style={{ minHeight: '100vh' }}>
        <Rail pathname={pathname} />
        <Sidebar sites={filteredSites} posts={displayPosts} activeSite={activeSite} onSiteClick={setActiveSite} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <TopBar title="지금 한국 커뮤니티는" sub={subtitle} />

          <div className="flex-1 p-6 pb-10 overflow-auto">
            {/* Settings banner */}
            {isLoaded && subscriptions.length === 0 && (
              <div className="mb-4 flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--accent-tint)', border: '1px solid rgba(79,70,229,.2)' }}>
                <span style={{ color: 'var(--accent)' }}>💡 원하는 커뮤니티만 선택해서 보세요!</span>
                <button
                  onClick={() => router.push('/settings')}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  설정하기
                </button>
              </div>
            )}

            {/* Subscriptions display */}
            {subscriptions.length > 0 && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium" style={{ color: 'var(--fg-3)' }}>보는 중:</span>
                {subscriptions.slice(0, 6).map(name => {
                  const s = initialSites.find(x => x.name === name);
                  const color = SITE_COLORS[name] || '#71717a';
                  return (
                    <span key={name} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      {s?.displayName || name}
                    </span>
                  );
                })}
                {subscriptions.length > 6 && <span className="text-xs" style={{ color: 'var(--fg-3)' }}>+{subscriptions.length - 6}개</span>}
                <button onClick={() => router.push('/settings')} className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: 'var(--accent)' }}>변경</button>
              </div>
            )}

            {/* Stats */}
            {!loading && <StatsBar posts={displayPosts} />}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-10">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

            {/* Feed */}
            {!loading && (
              <section className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--fg)', margin: 0 }}>🔥 실시간 인기 게시글</h3>
                  <span className="text-[11px]" style={{ color: 'var(--fg-3)' }}>자동 갱신 · {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <PostList posts={displayPosts} sites={filteredSites} selectedSite={activeSite} />
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: single column */}
      <div
        className="sm:hidden"
        style={{
          paddingBottom: isApp && isAdLoaded
            ? 'calc(120px + max(env(safe-area-inset-bottom), 0px))'
            : 'calc(72px + max(env(safe-area-inset-bottom), 0px))',
        }}
      >
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 sticky z-10"
          style={{ top: 'env(safe-area-inset-top, 0px)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-base font-bold" style={{ color: 'var(--fg)' }}>{SITE_NAME}</span>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--pos)' }} />
        </div>

        <div className="px-4 py-3">
          {isLoaded && subscriptions.length === 0 && (
            <div className="mb-3 flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs"
              style={{ background: 'var(--accent-tint)', border: '1px solid rgba(79,70,229,.2)' }}>
              <span style={{ color: 'var(--accent)' }}>💡 커뮤니티를 선택해서 맞춤 피드를 만들어보세요</span>
              <button onClick={() => router.push('/settings')} className="flex-shrink-0 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer font-semibold" style={{ background: 'var(--accent)', color: '#fff', fontSize: 11 }}>
                설정
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <PostList posts={displayPosts} sites={filteredSites} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav pathname={pathname} isApp={isApp} isAdLoaded={isAdLoaded} />
    </div>
  );
}
