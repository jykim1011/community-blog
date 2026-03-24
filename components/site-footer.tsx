import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="mt-8 mb-12 sm:mb-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* 사이트 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {SITE_NAME}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              한국 주요 커뮤니티의 인기 게시글을 자동으로 수집하여 한곳에서 편리하게 모아보는 서비스입니다.
              30분마다 최신 인기글을 업데이트합니다.
            </p>
          </div>

          {/* 바로가기 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              바로가기
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  문의하기
                </Link>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.communityblog.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  앱 다운로드
                </a>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              법적 고지
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. 모든 게시글의 저작권은 원본 사이트 및 작성자에게 있습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
