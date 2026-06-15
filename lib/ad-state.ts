type AdStateListener = (isLoaded: boolean) => void;

// 하단 광고 높이 — 이 값을 기준으로 버튼/레이아웃 오프셋 계산
// BottomAdContainer 실제 높이: min-h-[60px] + py-2 = 76px
export const AD_HEIGHT_NATIVE = 64; // AdMob 배너
export const AD_HEIGHT_WEB = 76;    // AdSense 컨테이너

class AdStateManager {
  private isAdLoaded = false;
  private listeners: Set<AdStateListener> = new Set();

  setAdLoaded(loaded: boolean) {
    this.isAdLoaded = loaded;
    this.notifyListeners();
  }

  getAdLoaded(): boolean {
    return this.isAdLoaded;
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
