'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // localStorage 접근 실패 시 기본값 유지
    }
  }, [key]);

  const setValue = (value: T) => {
    setStoredValue(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 실패 시 무시
    }
  };

  return [storedValue, setValue];
}
