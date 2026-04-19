'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SITE_NAME } from '@/lib/constants';
import { adStateManager } from '@/lib/ad-state';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isApp, setIsApp] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(true);

  useEffect(() => {
    const isCapacitor = typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      (window as any).Capacitor !== undefined
    );
    setIsApp(isCapacitor);
    const unsubscribe = adStateManager.subscribe(setIsAdLoaded);

    const checkMobile = () => setIsMobileView(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/trends', label: '트렌드' },
    { href: '/hot', label: '🔥 인기글' },
    { href: '/communities', label: '가이드' },
    { href: '/settings', label: '설정' },
  ];

  return (
    <>
      {isMobileView && <div className="h-3" />}

      {/* 데스크톱 네비게이션 */}
      {!isMobileView && <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white transition-colors hover:text-violet-600 dark:hover:text-violet-400"
            >
              {SITE_NAME}
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
      </nav>}

      {/* 모바일 하단 탭 바 */}
      <nav
        className="sm:hidden fixed left-0 right-0 flex items-center justify-around z-50"
        style={{
          bottom: isApp && isAdLoaded
            ? 'calc(60px + max(env(safe-area-inset-bottom), 0px))'
            : '0',
          height: 56,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          paddingBottom: isApp && isAdLoaded ? '0' : 'max(env(safe-area-inset-bottom), 0px)',
        }}
      >
        {[
          { href: '/', label: '홈', paths: ['M3 10.5L12 3l9 7.5', 'M5 9.5V21h14V9.5'] },
          { href: '/trends', label: '트렌드', paths: ['M3 17l6-6 4 4 8-8', 'M14 7h7v7'] },
          { href: '/hot', label: '인기글', paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'] },
          { href: '/settings', label: '설정', paths: ['M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2', 'M12 8v4', 'M12 16h.01'] },
          { href: '/communities', label: '가이드', paths: ['M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'] },
        ].map(({ href, label, paths }) => {
          const isActive = pathname === href;
          const iconColor = isActive ? '#4f46e5' : '#71717a';
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 border-0 bg-transparent cursor-pointer"
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {paths.map((d, i) => <path key={i} d={d} />)}
              </svg>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: iconColor }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
