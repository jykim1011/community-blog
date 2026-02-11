import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  site?: string | null;
}

export function Pagination({ currentPage, totalPages, site }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (site) params.set('site', site);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  }

  // 표시할 페이지 번호 범위 계산 (최대 5개)
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      {/* 이전 */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          이전
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
          이전
        </span>
      )}

      {/* 첫 페이지 + 생략 */}
      {start > 1 && (
        <>
          <Link
            href={buildHref(1)}
            className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            1
          </Link>
          {start > 2 && (
            <span className="px-2 py-2 text-sm text-gray-400 dark:text-gray-600">
              ...
            </span>
          )}
        </>
      )}

      {/* 페이지 번호 */}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={
            page === currentPage
              ? 'px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg'
              : 'px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        >
          {page}
        </Link>
      ))}

      {/* 생략 + 마지막 페이지 */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-2 py-2 text-sm text-gray-400 dark:text-gray-600">
              ...
            </span>
          )}
          <Link
            href={buildHref(totalPages)}
            className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* 다음 */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          다음
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
          다음
        </span>
      )}
    </nav>
  );
}
