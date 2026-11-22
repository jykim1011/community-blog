'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { REWARDED_AD_UNIT, getAdFreeUntil, subscribeAdFree } from '@/lib/ad-free';

// setTimeout 최대 지연(약 24.8일). 이보다 길면 즉시 실행돼 버린다.
const MAX_TIMEOUT = 2_147_483_647;

/**
 * 설정 아이콘에 빨간 점을 띄울지 여부.
 * '광고 없이 보기'를 쓸 수 있는데(앱 + 보상형 단위 준비) 지금 광고가 나오는 중이면 true.
 * 광고 제거를 받으면 즉시 사라지고, 24시간이 끝나면 다시 나타난다.
 */
export function useAdFreeHint(): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !REWARDED_AD_UNIT) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      if (timer) clearTimeout(timer);
      const remaining = getAdFreeUntil() - Date.now();
      setShow(remaining <= 0);
      // 만료 시점에 다시 확인해 점을 되살린다
      if (remaining > 0) timer = setTimeout(sync, Math.min(remaining + 500, MAX_TIMEOUT));
    };

    sync();
    const unsubscribe = subscribeAdFree(sync);
    // 백그라운드에선 타이머가 멈출 수 있으니 앱으로 돌아올 때도 확인한다
    const onVisible = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return show;
}
