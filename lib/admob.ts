import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';

// AdMob 앱 ID (실제 ID)
const ADMOB_APP_ID = 'ca-app-pub-4710152968528474~2341859043';

// 광고 단위 ID
export const AD_UNITS = {
  // 배너 광고 (SDK 통합 ID)
  BANNER_TOP: 'ca-app-pub-4710152968528474/5725881924',
  BANNER_BOTTOM: 'ca-app-pub-4710152968528474/5725881924',

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

    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: adPosition,
      margin: 0,
    });

    console.log(`Banner ad shown at ${position}`);
  } catch (error) {
    console.error('Failed to show banner ad:', error);
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
  try {
    await AdMob.removeBanner();
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
