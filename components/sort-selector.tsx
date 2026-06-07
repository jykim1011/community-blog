'use client';

export type SortOption = 'popular' | 'comments' | 'recent';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent',   label: '최신순' },
  { value: 'popular',  label: '인기순' },
  { value: 'comments', label: '댓글순' },
];

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3, borderRadius: 10,
      background: 'var(--surface-2)',
    }}>
      {sortOptions.map((o) => (
        <button
          key={o.value}
          onClick={() => onSortChange(o.value)}
          style={{
            border: 'none', borderRadius: 7, padding: '5px 12px',
            fontSize: 12.5, whiteSpace: 'nowrap', fontFamily: 'inherit',
            fontWeight: 600, cursor: 'pointer',
            background: currentSort === o.value ? 'var(--surface)' : 'transparent',
            color: currentSort === o.value ? 'var(--fg)' : 'var(--fg-3)',
            boxShadow: currentSort === o.value ? 'var(--shadow-sm)' : 'none',
            transition: 'all .15s ease',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
