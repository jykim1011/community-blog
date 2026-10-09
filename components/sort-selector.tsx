'use client';

export type SortOption = 'trending' | 'recent' | 'comments';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'trending', label: '실시간' },
  { value: 'recent',   label: '최신순' },
  { value: 'comments', label: '댓글순' },
];

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {sortOptions.map((o, i) => {
        const active = currentSort === o.value;
        return (
          <span key={o.value} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {i > 0 && <span style={{ width: 1, height: 10, background: 'var(--border-hv)' }} />}
            <button
              onClick={() => onSortChange(o.value)}
              aria-pressed={active}
              style={{
                border: 'none', background: 'none', padding: '6px 8px',
                fontSize: 13, whiteSpace: 'nowrap', fontFamily: 'inherit',
                fontWeight: active ? 700 : 500, cursor: 'pointer',
                color: active ? 'var(--fg)' : 'var(--fg-4)',
                transition: 'color .15s ease',
              }}
            >
              {o.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
