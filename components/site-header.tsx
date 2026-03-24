import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

export function SiteHeader() {
  return (
    <>
      {/* 모바일: 기존 안전 영역 여백만 (앱/웹 동일) */}
      <div className="h-3 sm:hidden" />

      {/* 데스크톱: 네비게이션 바 */}
      <nav className="hidden sm:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* 로고 */}
            <Link
              href="/"
              className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {SITE_NAME}
            </Link>

            {/* 데스크톱 메뉴 */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                홈
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                소개
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                문의
              </Link>
              <a
                href="https://play.google.com/store/apps/details?id=com.communityblog.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                앱 다운로드
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
