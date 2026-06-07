'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SITE_NAME } from '@/lib/constants';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileView, setIsMobileView] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/hot', label: '🔥 인기글' },
    { href: '/communities', label: '가이드' },
    { href: '/trends', label: '트렌드' },
    { href: '/settings', label: '설정' },
  ];

  return (
    <>
      {/* 모바일 상단 헤더 */}
      {isMobileView && (
        <nav className="sm:hidden sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-14 px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon-192.png" alt={SITE_NAME} width={28} height={28} className="rounded-lg" />
              <span className="text-base font-bold text-gray-900 dark:text-white">{SITE_NAME}</span>
            </Link>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="설정"
              style={{ color: pathname === '/settings' ? 'var(--accent, #4f46e5)' : undefined }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                stroke={pathname === '/settings' ? '#4f46e5' : 'currentColor'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </nav>
      )}

      {/* 데스크톱 네비게이션 */}
      {!isMobileView && (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/icon-192.png"
                  alt={SITE_NAME}
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {SITE_NAME}
                </span>
              </Link>

              <div className="flex items-center gap-1">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname === href
                        ? 'text-gray-900 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <a
                  href="https://play.google.com/store/apps/details?id=com.communityblog.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  앱
                </a>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
