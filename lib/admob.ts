import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import type { PluginListenerHandle } from '@capacitor/core';
import { REWARDED_AD_UNIT, isAdFree } from './ad-free';
import { adStateManager } from './ad-state';
import { track } from './analytics';

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
// (앱 ID 는 AndroidManifest.xml 의 APPLICATION_ID 에 있다: ca-app-pub-4710152968528474~2341859043)

// 광고 단위 ID
export const AD_UNITS = {
  // 배너 광고 (AdMob 실제 ID)
  // 위쪽 전용 단위(…/5725881924)는 AdMob에 없어 아래 배너 단위를 같이 쓴다 (배너 단위는 위치와 무관)
  BANNER_TOP: 'ca-app-pub-4710152968528474/6863735590',
  BANNER_BOTTOM: 'ca-app-pub-4710152968528474/6863735590', // community-bottom

  // 보상형 광고 ("광고 보고 24시간 배너 없이 보기") — 값은 lib/ad-free.ts 에서 관리
  REWARDED: REWARDED_AD_UNIT,

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
    // 광고 없는 시간이 아니면 '광고 없이 보기'용 보상형 광고를 미리 받아 둔다
    if (!isAdFree()) void preloadRewardedAd();
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
        // 실패 기록 (GA4): 0 내부 오류 · 1 잘못된 요청 · 2 네트워크 · 3 채울 광고 없음
        track('ad_load_fail', {
          ad_format: 'banner',
          position: lastBannerPosition ?? 'none',
          code: typeof error?.code === 'number' ? error.code : -1,
          reason: String(error?.message ?? '').slice(0, 100),
          attempt: bannerRetryCount + 1,
        });
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
    track('ad_show_fail', { ad_format: 'banner', position, reason: String(error).slice(0, 100) });
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

export type RewardedResult = 'rewarded' | 'skipped' | 'failed';

// ── 보상형 광고 미리 받기 ─────────────────────────────
// 예전엔 버튼을 누른 뒤에야 광고를 받기 시작해 기다림이 길고, 받다 실패하면 노출이 날아갔다.
// 이제 앱을 켤 때(광고 없는 시간이 아닐 때)와 설정 화면을 열 때 미리 받아 둔다.
// 받은 광고는 60분이면 만료되므로 50분이 지나면 버리고 새로 받는다.
// 플러그인은 보여 준 광고를 비우지 않아(mRewardedAd) 한 번 보여 주면 반드시 새로 받아야 한다.
const REWARDED_MAX_AGE_MS = 50 * 60_000;
const REWARDED_RETRY_MIN_MS = 5_000;
const REWARDED_RETRY_MAX_MS = 120_000;

let rewardedLoadedAt = 0; // 0 = 보여 줄 수 있는 광고 없음
let rewardedLoading: Promise<boolean> | null = null;
let rewardedRetryMs = REWARDED_RETRY_MIN_MS;
let rewardedRetryTimer: ReturnType<typeof setTimeout> | null = null;
let rewardedFails = 0;
let rewardedShowing = false;

function isRewardedFresh() {
  return rewardedLoadedAt > 0 && Date.now() - rewardedLoadedAt < REWARDED_MAX_AGE_MS;
}

/**
 * 보상형 광고를 미리 받아 둔다. 이미 받아 뒀거나 받는 중이면 그대로 둔다.
 * 받아 두었으면 true. 실패하면 점점 늘어나는 간격(5초→최대 2분)으로 다시 시도한다.
 */
export function preloadRewardedAd(): Promise<boolean> {
  if (!AD_UNITS.REWARDED || rewardedShowing) return Promise.resolve(false);
  if (isRewardedFresh()) return Promise.resolve(true);
  if (rewardedLoading) return rewardedLoading;

  if (rewardedRetryTimer) clearTimeout(rewardedRetryTimer);
  rewardedRetryTimer = null;
  rewardedLoadedAt = 0;

  rewardedLoading = AdMob.prepareRewardVideoAd({ adId: AD_UNITS.REWARDED })
    .then(() => {
      rewardedLoadedAt = Date.now();
      rewardedRetryMs = REWARDED_RETRY_MIN_MS;
      rewardedFails = 0;
      return true;
    })
    .catch((error) => {
      rewardedFails++;
      // 재시도마다 보내지 않게 처음 몇 번만 기록 (GA4)
      if (rewardedFails <= 3) {
        track('ad_load_fail', {
          ad_format: 'rewarded',
          reason: String(error?.message ?? error).slice(0, 100),
          attempt: rewardedFails,
        });
      }
      rewardedRetryTimer = setTimeout(() => {
        rewardedRetryTimer = null;
        void preloadRewardedAd();
      }, rewardedRetryMs);
      rewardedRetryMs = Math.min(rewardedRetryMs * 2, REWARDED_RETRY_MAX_MS);
      return false;
    })
    .finally(() => {
      rewardedLoading = null;
    });
  return rewardedLoading;
}

/**
 * 보상형 광고 표시. 끝까지 봐서 보상을 받았으면 'rewarded'.
 * 미리 받아 둔 광고가 있으면 바로 보여 주고, 없으면 그 자리에서 받아 보여 준다.
 *
 * 플러그인의 showRewardVideoAd() 는 보상을 받을 때만 resolve 되고, 중간에 닫으면
 * 영원히 끝나지 않는다. 그래서 결과는 Rewarded/Dismissed 이벤트로 판단한다.
 */
export async function showRewardedAd(): Promise<RewardedResult> {
  if (!AD_UNITS.REWARDED || rewardedShowing) return 'failed';
  const preloaded = isRewardedFresh();
  const handles: PluginListenerHandle[] = [];
  let result: RewardedResult = 'failed';
  try {
    if (!preloaded && !(await preloadRewardedAd())) {
      track('reward_ad', { result: 'failed', preloaded: false, reason: 'load_failed' });
      return 'failed';
    }

    let rewarded = false;
    let finish: (r: RewardedResult) => void = () => {};
    const done = new Promise<RewardedResult>((resolve) => { finish = resolve; });

    handles.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { rewarded = true; }));
    handles.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(rewarded ? 'rewarded' : 'skipped')));
    handles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish('failed')));

    rewardedShowing = true;
    rewardedLoadedAt = 0; // 한 번 보여 준 광고는 다시 못 쓴다
    AdMob.showRewardVideoAd().catch(() => finish('failed'));

    result = await done;
    track('reward_ad', { result, preloaded });
    return result;
  } catch (error) {
    track('reward_ad', { result: 'failed', preloaded, reason: String(error).slice(0, 100) });
    return 'failed';
  } finally {
    handles.forEach((h) => h.remove());
    if (rewardedShowing) {
      rewardedShowing = false;
      // 보상을 못 받았으면 바로 다시 시도할 수 있게 다시 받아 둔다.
      // 보상을 받았으면 24시간 동안 쓸 일이 드물어(받아 둬도 만료됨) 설정 화면을 다시 열 때 받는다
      if (result !== 'rewarded') void preloadRewardedAd();
    }
  }
}
