'use client';

import { useMemo } from 'react';
import { setStoredItem, useStoredItem } from './use-client-value';

/**
 * localStorage 에 JSON 으로 저장되는 값. 서버·하이드레이션 중에는 initialValue.
 * 같은 키를 쓰는 컴포넌트는 모두 같은 값을 본다.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const raw = useStoredItem(key);

  const storedValue = useMemo<T>(() => {
    if (raw === null) return initialValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
    // initialValue 는 호출할 때마다 새 객체일 수 있어 raw 가 바뀔 때만 다시 계산한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const setValue = (value: T) => setStoredItem(key, JSON.stringify(value));

  return [storedValue, setValue];
}
