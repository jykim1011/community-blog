import { useSyncExternalStore } from 'react';

type AdStateListener = (isLoaded: boolean) => void;

// 하단 광고 높이 — 이 값을 기준으로 버튼/레이아웃 오프셋 계산
// BottomAdContainer 실제 높이: min-h-[60px] + py-2 = 76px
export const AD_HEIGHT_NATIVE = 64; // AdMob 배너
export const AD_HEIGHT_WEB = 76;    // AdSense 컨테이너
// 콘텐츠와 배너 사이 여백. 탭할 수 있는 요소(뷰어 목록 등)가 배너에 맞닿으면
// 실수 클릭이 생기고, 무효 클릭 차감·단가 하락으로 이어진다.
export const AD_GAP = 8;

class AdStateManager {
  private isAdLoaded = false;
  // AdMob 이 알려준 실제 배너 높이(dp). 적응형 배너라 기기마다 다르다.
  private bannerHeight = AD_HEIGHT_NATIVE;
  private listeners: Set<AdStateListener> = new Set();

  setBannerHeight(height: number) {
    if (height > 0 && height !== this.bannerHeight) {
      this.bannerHeight = height;
      this.notifyListeners();
    }
  }

  getBannerHeight(): number {
    return this.bannerHeight;
  }

  setAdLoaded(loaded: boolean) {
    this.isAdLoaded = loaded;
    this.notifyListeners();
  }

  getAdLoaded(): boolean {
    return this.isAdLoaded;
  }

  /** 네이티브 배너가 떠 있을 때 콘텐츠가 비워 둬야 할 하단 높이(px). 배너가 없으면 0 */
  getNativeInset(): number {
    return this.isAdLoaded ? this.bannerHeight + AD_GAP : 0;
  }

  subscribe(listener: AdStateListener) {
    this.listeners.add(listener);
    // 즉시 현재 상태 전달
    listener(this.isAdLoaded);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isAdLoaded));
  }
}

export const adStateManager = new AdStateManager();

/** 네이티브 배너 높이 + 여백(px). 배너가 없거나 크기가 바뀌면 다시 렌더된다 */
export function useNativeAdInset(): number {
  return useSyncExternalStore(
    (cb) => adStateManager.subscribe(() => cb()),
    () => adStateManager.getNativeInset(),
    () => 0,
  );
}
