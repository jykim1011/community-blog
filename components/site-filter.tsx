'use client';

import { SiteCategory, categoryLabels } from '@/lib/constants';

interface Site {
  id: string;
  displayName: string;
  name: string;
  category: SiteCategory;
}

interface SiteFilterProps {
  sites: Site[];
  currentSite: string | null;
  currentCategory: SiteCategory | null;
  onSiteChange: (site: string | null) => void;
  onCategoryChange: (category: SiteCategory | null) => void;
}

const catEmoji: Record<string, string> = {
  community: '💬',
  hotdeal: '🛍',
  movie: '🎬',
  game: '🎮',
};

function FilterChip({
  children,
  active,
  onClick,
  activeColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  activeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer transition-colors"
      style={
        active
          ? { background: activeColor, color: '#fff' }
          : { background: 'var(--surface-2)', color: 'var(--fg-2)' }
      }
    >
      {children}
    </button>
  );
}

export function SiteFilter({
  sites,
  currentSite,
  currentCategory,
  onSiteChange,
  onCategoryChange,
}: SiteFilterProps) {
  const filteredSites = currentCategory
    ? sites.filter((site) => site.category === currentCategory)
    : sites;

  const availableCategories = Array.from(new Set(sites.map((site) => site.category)));
  const allCategories: SiteCategory[] = ['community', 'hotdeal', 'movie', 'game'];
  const categories = allCategories.filter((cat) => availableCategories.includes(cat));

  return (
    <div className="space-y-1.5 px-3 pt-3">
      {/* 카테고리 필터 */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 w-max py-0.5">
          <FilterChip
            active={!currentCategory}
            onClick={() => { onCategoryChange(null); onSiteChange(null); }}
            activeColor="var(--accent)"
          >
            전체
          </FilterChip>
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              active={currentCategory === cat}
              onClick={() => { onCategoryChange(cat); onSiteChange(null); }}
              activeColor="var(--accent)"
            >
              {catEmoji[cat]} {categoryLabels[cat]}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* 사이트 필터 */}
      <div className="overflow-x-auto scrollbar-hide pb-1">
        <div className="flex gap-1.5 w-max py-0.5">
          <FilterChip
            active={!currentSite}
            onClick={() => onSiteChange(null)}
            activeColor="var(--pos)"
          >
            전체
          </FilterChip>
          {filteredSites.map((site) => (
            <FilterChip
              key={site.id}
              active={currentSite === site.name}
              onClick={() => onSiteChange(site.name)}
              activeColor="var(--pos)"
            >
              {site.displayName}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );
}
