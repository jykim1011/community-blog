'use client';

interface Site {
  id: string;
  displayName: string;
  name: string;
}

interface SiteFilterProps {
  sites: Site[];
  currentSite: string | null;
  onSiteChange: (site: string | null) => void;
}

export function SiteFilter({ sites, currentSite, onSiteChange }: SiteFilterProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSiteChange(value === '' ? null : value);
  };

  return (
    <div className="mb-2 sm:mb-3">
      {/* 모바일: Select Box */}
      <div className="sm:hidden mt-4">
        <select
          value={currentSite || ''}
          onChange={handleSelectChange}
          className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">전체</option>
          {sites.map((site) => (
            <option key={site.id} value={site.name}>
              {site.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* 데스크탑: 탭 버튼 */}
      <div className="hidden sm:flex flex-wrap gap-2">
        <button
          onClick={() => onSiteChange(null)}
          className={
            !currentSite
              ? 'px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium'
              : 'px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700'
          }
        >
          전체
        </button>
        {sites.map((site) => (
          <button
            key={site.id}
            onClick={() => onSiteChange(site.name)}
            className={
              currentSite === site.name
                ? 'px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium'
                : 'px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          >
            {site.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}
