'use client';

export type SortOption = 'popular' | 'comments' | 'recent';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'recent', label: '최신순', icon: '⏰' },
  { value: 'popular', label: '인기순', icon: '🔥' },
  { value: 'comments', label: '댓글순', icon: '💬' },
];

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <span className="text-[11px] font-semibold flex-shrink-0 uppercase tracking-wide" style={{ color: 'var(--fg-3)' }}>
        정렬
      </span>
      <div className="flex gap-1.5">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer transition-colors"
            style={
              currentSort === option.value
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-2)' }
            }
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
