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

export function SiteFilter({
  sites,
  currentSite,
  currentCategory,
  onSiteChange,
  onCategoryChange,
}: SiteFilterProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSiteChange(value === '' ? null : value);
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCategoryChange(value === '' ? null : (value as SiteCategory));
  };

  // 선택된 카테고리에 속한 사이트만 필터링
  const filteredSites = currentCategory
    ? sites.filter((site) => site.category === currentCategory)
    : sites;

  // 실제 존재하는 카테고리만 표시 (선택된 커뮤니티의 카테고리만)
  const availableCategories = Array.from(new Set(sites.map(site => site.category)));
  const allCategories: SiteCategory[] = ['community', 'hotdeal', 'movie', 'game'];
  const categories = allCategories.filter(cat => availableCategories.includes(cat));

  return (
    <div className="mb-2 sm:mb-3 space-y-3">
      {/* 모바일: Select Box */}
      <div className="sm:hidden mt-4 space-y-2">
        {/* 카테고리 선택 */}
        <select
          value={currentCategory || ''}
          onChange={handleCategorySelectChange}
          className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]}
            </option>
          ))}
        </select>

        {/* 사이트 선택 */}
        <select
          value={currentSite || ''}
          onChange={handleSelectChange}
          className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">전체 사이트</option>
          {filteredSites.map((site) => (
            <option key={site.id} value={site.name}>
              {site.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* 데스크톱: 탭 버튼 */}
      <div className="hidden sm:block space-y-2">
        {/* 카테고리 탭 (가로 스크롤) */}
        <div className="overflow-x-auto scrollbar-hide pb-2">
          <div className="flex gap-1.5 w-max">
          <button
            onClick={() => {
              onCategoryChange(null);
              onSiteChange(null);
            }}
            className={
              !currentCategory
                ? 'px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm transition-all'
                : 'px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
            }
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat);
                onSiteChange(null);
              }}
              className={
                currentCategory === cat
                  ? 'px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm transition-all'
                  : 'px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
              }
            >
              {categoryLabels[cat]}
            </button>
          ))}
          </div>
        </div>

        {/* 사이트 탭 (가로 스크롤) */}
        <div className="overflow-x-auto scrollbar-hide pb-2">
          <div className="flex gap-1.5 w-max">
            <button
              onClick={() => onSiteChange(null)}
              className={
                !currentSite
                  ? 'px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-sm transition-all'
                  : 'px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
              }
            >
              전체
            </button>
            {filteredSites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSiteChange(site.name)}
                className={
                  currentSite === site.name
                    ? 'px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-sm transition-all'
                    : 'px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
                }
              >
                {site.displayName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
