'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { adStateManager, AD_HEIGHT_NATIVE, AD_HEIGHT_WEB } from '@/lib/ad-state';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(() => adStateManager.getAdLoaded());
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });

    const unsubscribe = adStateManager.subscribe(setIsAdLoaded);

    return () => {
      window.removeEventListener('scroll', onScroll);
      unsubscribe();
    };
  }, []);

  if (!visible) return null;

  const adHeight = isAdLoaded ? (isNative ? AD_HEIGHT_NATIVE : AD_HEIGHT_WEB) : 0;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="sm:hidden fixed left-1/2 -translate-x-1/2 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg active:scale-95 transition-[transform,bottom] duration-200"
      style={{
        bottom: `calc(${adHeight}px + max(env(safe-area-inset-bottom), 0px) + 16px)`,
      }}
      aria-label="맨 위로"
    >
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        className="stroke-gray-600 dark:stroke-gray-300"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
