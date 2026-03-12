'use client';

export type SortOption = 'popular' | 'comments' | 'recent';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'popular', label: '인기순', icon: '🔥' },
  { value: 'comments', label: '댓글순', icon: '💬' },
  { value: 'recent', label: '최신순', icon: '⏰' },
];

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium hidden sm:inline">정렬:</span>
      <div className="flex gap-1.5">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentSort === option.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
