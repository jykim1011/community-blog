'use client';

import { useCallback } from 'react';
import { useClientValue } from './use-client-value';

/**
 * 미디어 쿼리 훅
 * @param query - CSS 미디어 쿼리 문자열 (예: '(min-width: 768px)')
 * @returns 미디어 쿼리 매칭 여부 (서버·하이드레이션 중에는 false)
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    [query],
  );
  return useClientValue(() => window.matchMedia(query).matches, false, subscribe);
}
