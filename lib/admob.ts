import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { adStateManager } from './ad-state';

// FailedToLoad 리스너 중복 등록 방지
let bannerFailedListenerAdded = false;

// 로드 실패 시 다시 시도 (예전엔 한 번 실패하면 그 실행 내내 배너가 없었다)
const BANNER_RETRY_DELAYS_MS = [30_000, 60_000, 120_000];
let bannerRetryCount = 0;
let bannerRetryTimer: ReturnType<typeof setTimeout> | null = null;
let lastBannerPosition: 'top' | 'bottom' | null = null;

function clearBannerRetry() {
  if (bannerRetryTimer) clearTimeout(bannerRetryTimer);
  bannerRetryTimer = null;
}

function scheduleBannerRetry() {
  if (bannerRetryTimer || lastBannerPosition === null) return;
  const delay = BANNER_RETRY_DELAYS_MS[bannerRetryCount];
  if (delay === undefined) return; // 몇 번 해도 안 되면 이번 실행에서는 그만
  bannerRetryCount++;
  bannerRetryTimer = setTimeout(async () => {
    bannerRetryTimer = null;
    const position = lastBannerPosition;
    if (position === null) return; // 그사이 배너를 치웠다
    try {
      await AdMob.removeBanner();
    } catch {
      // 없으면 그대로
    }
    await showBannerAd(position);
  }, delay);
}

// AdMob 앱 ID (실제 ID)
const ADMOB_APP_ID = 'ca-app-pub-4710152968528474~2341859043';

// 광고 단위 ID
export const AD_UNITS = {
  // 배너 광고 (AdMob 실제 ID)
  // 위쪽 전용 단위(…/5725881924)는 AdMob에 없어 아래 배너 단위를 같이 쓴다 (배너 단위는 위치와 무관)
  BANNER_TOP: 'ca-app-pub-4710152968528474/6863735590',
  BANNER_BOTTOM: 'ca-app-pub-4710152968528474/6863735590', // community-bottom

  // 인터스티셜 광고 (나중에 생성 시 추가)
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // TODO: 실제 인터스티셜 ID로 교체
};

/**
 * AdMob 초기화
 */
export async function initializeAdMob() {
  try {
    await AdMob.initialize({
      testingDevices: [], // 프로덕션: 빈 배열
      initializeForTesting: false, // 프로덕션: 실제 광고
    });
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('AdMob initialization failed:', error);
  }
}

/**
 * 배너 광고 표시
 */
export async function showBannerAd(position: 'top' | 'bottom' = 'bottom') {
  try {
    const adPosition = position === 'top'
      ? BannerAdPosition.TOP_CENTER
      : BannerAdPosition.BOTTOM_CENTER;

    const adId = position === 'top' ? AD_UNITS.BANNER_TOP : AD_UNITS.BANNER_BOTTOM;
    lastBannerPosition = position;

    // 로드 실패 리스너 중복 등록 방지 (showBannerAd 재호출 시 누적 방지)
    if (!bannerFailedListenerAdded) {
      bannerFailedListenerAdded = true;
      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
        console.error('Banner ad failed to load:', error);
        adStateManager.setAdLoaded(false);
        scheduleBannerRetry();
      });
      // 실패로 네비를 내린 뒤 배너가 다시 들어오면(재시도·자동 새로고침) 네비를 다시 올린다.
      // 예전엔 이 리스너가 없어 새로 뜬 배너가 하단 네비를 덮을 수 있었다
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        bannerRetryCount = 0;
        clearBannerRetry();
        adStateManager.setAdLoaded(true);
      });
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
        adStateManager.setBannerHeight(size.height);
      });
    }

    // nav를 먼저 올린 후 광고 표시 → 네이티브 뷰가 나타나기 전에 React가 리렌더되도록
    adStateManager.setAdLoaded(true);

    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: adPosition,
      margin: 0,
    });

    console.log(`Banner ad shown at ${position}`);
  } catch (error) {
    console.error('Failed to show banner ad:', error);
    adStateManager.setAdLoaded(false);
    scheduleBannerRetry();
  }
}

/**
 * 배너 광고 숨기기
 */
export async function hideBannerAd() {
  try {
    await AdMob.hideBanner();
    console.log('Banner ad hidden');
  } catch (error) {
    console.error('Failed to hide banner ad:', error);
  }
}

/**
 * 배너 광고 제거
 */
export async function removeBannerAd() {
  lastBannerPosition = null;
  clearBannerRetry();
  try {
    await AdMob.removeBanner();
    adStateManager.setAdLoaded(false);
    console.log('Banner ad removed');
  } catch (error) {
    console.error('Failed to remove banner ad:', error);
  }
}

/**
 * 배너 광고 재개
 */
export async function resumeBannerAd() {
  try {
    await AdMob.resumeBanner();
    console.log('Banner ad resumed');
  } catch (error) {
    console.error('Failed to resume banner ad:', error);
  }
}

/**
 * 인터스티셜 광고 준비 (선택)
 */
export async function prepareInterstitialAd() {
  try {
    await AdMob.prepareInterstitial({
      adId: AD_UNITS.INTERSTITIAL,
    });
    console.log('Interstitial ad prepared');
  } catch (error) {
    console.error('Failed to prepare interstitial ad:', error);
  }
}

/**
 * 인터스티셜 광고 표시 (선택)
 */
export async function showInterstitialAd() {
  try {
    await AdMob.showInterstitial();
    console.log('Interstitial ad shown');
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
  }
}
