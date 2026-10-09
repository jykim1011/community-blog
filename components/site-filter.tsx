'use client';

import { SiteCategory } from '@/lib/constants';

export type FeedCategory = SiteCategory | 'hot';

interface SiteFilterProps {
  currentCategory: FeedCategory | null;
  onCategoryChange: (category: FeedCategory | null) => void;
  /** 지정하면 이 위치에 sticky 로 고정된다 (예: 모바일 헤더 높이). */
  stickyTop?: string;
}

const TABS: { key: FeedCategory | null; label: string }[] = [
  { key: null,        label: '전체' },
  { key: 'hot',       label: '인기' },
  { key: 'community', label: '커뮤니티' },
  { key: 'hotdeal',   label: '핫딜' },
  { key: 'movie',     label: '영화' },
  { key: 'game',      label: '게임' },
];

export function SiteFilter({ currentCategory, onCategoryChange, stickyTop }: SiteFilterProps) {
  return (
    <div
      className="overflow-x-auto scrollbar-hide touch-pan-x overscroll-x-contain"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        ...(stickyTop !== undefined && { position: 'sticky', top: stickyTop, zIndex: 20 }),
      }}
    >
      <div role="tablist" style={{ display: 'flex', gap: 4, padding: '0 10px', width: 'max-content' }}>
        {TABS.map(({ key, label }) => {
          const active = currentCategory === key;
          const isHot = key === 'hot';
          const activeColor = isHot ? 'var(--hot)' : 'var(--fg)';
          return (
            <button
              key={key ?? 'all'}
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(active && key !== null ? null : key)}
              style={{
                position: 'relative',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                height: 44, padding: '0 10px',
                fontSize: 15, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? activeColor : 'var(--fg-3)',
                transition: 'color .15s ease',
              }}
            >
              {isHot && (
                <svg width={13} height={13} viewBox="0 0 24 24" fill={active ? 'var(--hot)' : 'none'}
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" />
                </svg>
              )}
              {label}
              <span style={{
                position: 'absolute', left: 10, right: 10, bottom: -1, height: 2.5,
                borderRadius: 2, background: active ? activeColor : 'transparent',
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
