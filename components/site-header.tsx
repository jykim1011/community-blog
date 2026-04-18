'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SITE_NAME } from '@/lib/constants';
import { adStateManager } from '@/lib/ad-state';

export function SiteHeader() {
  const pathname = usePathname();
  const [isApp, setIsApp] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Capacitor 앱 환경 감지
    const isCapacitor = typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      (window as any).Capacitor !== undefined
    );
    setIsApp(isCapacitor);

    // 광고 로드 상태 구독
    const unsubscribe = adStateManager.subscribe(setIsAdLoaded);
    return unsubscribe;
  }, []);

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
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                홈
              </Link>
              <Link
                href="/trends"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                트렌드
              </Link>
              <Link
                href="/communities"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                가이드
              </Link>
              <Link
                href="/search"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                검색
              </Link>
              <Link
                href="/settings"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                설정
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
                앱
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 모바일: 하단 고정 탭 바 */}
      <nav
        className="sm:hidden fixed left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50"
        style={{
          // 앱: 광고 높이(50-60px)만큼 위로 올림 (광고가 네비 아래 표시)
          // 웹: 화면 최하단 (bottom-0)
          bottom: isApp && isAdLoaded ? '60px' : '0',
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        }}
      >
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === '/'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">홈</span>
          </Link>

          <Link
            href="/trends"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === '/trends'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium">트렌드</span>
          </Link>

          <Link
            href="/settings"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === '/settings'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">설정</span>
          </Link>

          <Link
            href="/search"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === '/search'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium">검색</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
