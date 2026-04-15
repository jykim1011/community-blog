/**
 * 광고 로드 상태 관리
 * 웹/앱에서 광고 로드 성공 여부를 추적하여 레이아웃 조정에 사용
 */

type AdStateListener = (isLoaded: boolean) => void;

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
