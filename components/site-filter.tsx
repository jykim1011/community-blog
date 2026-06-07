'use client';

import { SiteCategory, categoryLabels } from '@/lib/constants';

export type FeedCategory = SiteCategory | 'hot';

interface SiteFilterProps {
  currentCategory: FeedCategory | null;
  onCategoryChange: (category: FeedCategory | null) => void;
}

const ALL_CATEGORIES: FeedCategory[] = ['hot', 'community', 'hotdeal', 'movie', 'game'];

const catLabel: Record<FeedCategory, string> = {
  hot:       '🔥 인기',
  community: '커뮤니티',
  hotdeal:   '핫딜',
  movie:     '영화',
  game:      '게임',
};

export function SiteFilter({ currentCategory, onCategoryChange }: SiteFilterProps) {
  return (
    <div
      className="overflow-x-auto scrollbar-hide touch-pan-x overscroll-x-contain"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', gap: 8, padding: '10px 18px', width: 'max-content' }}>

        {/* 전체 */}
        <button
          onClick={() => onCategoryChange(null)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
            transition: 'all .15s ease',
            border: '1px solid',
            borderColor: !currentCategory ? 'transparent' : 'var(--border)',
            background: !currentCategory ? 'var(--accent)' : 'var(--surface)',
            color: !currentCategory ? '#fff' : 'var(--fg-2)',
          }}
        >
          전체
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const active = currentCategory === cat;
          const isHot = cat === 'hot';
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(active ? null : cat)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                transition: 'all .15s ease',
                border: '1px solid',
                borderColor: active ? 'transparent' : 'var(--border)',
                background: active ? (isHot ? 'var(--hot)' : 'var(--accent)') : 'var(--surface)',
                color: active ? '#fff' : 'var(--fg-2)',
              }}
            >
              {catLabel[cat]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
