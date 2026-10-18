import { Capacitor } from '@capacitor/core';
import { adStateManager } from '@/lib/ad-state';

interface OpenOptions {
  /** 툴바에 표시할 제목 (사이트명) */
  title?: string;
  /** 툴바 색상 (사이트 브랜드 컬러) */
  color?: string;
}

function safeInset(side: 'top' | 'bottom'): number {
  // Capacitor 는 구버전 WebView 에서 env() 대신 --safe-area-inset-* 변수로 값을 넣어준다
  const probe = document.createElement('div');
  probe.style.paddingTop = `max(env(safe-area-inset-${side}, 0px), var(--safe-area-inset-${side}, 0px))`;
  document.documentElement.appendChild(probe);
  const value = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return value;
}

/**
 * 인앱 브라우저가 하단 AdMob 배너 바로 위에서 끝나도록 할 높이(dp).
 *
 * 인앱 브라우저 창은 상태바를 포함한 화면 맨 위(y=0)부터 그려진다. 반면 edge-to-edge 가
 * 아닌 기기(Android 14 이하)에서 앱 WebView 는 상태바 아래에서 시작하므로 innerHeight 만
 * 쓰면 상태바 높이만큼 짧아져 배너 위로 피드가 비쳐 보인다. WebView 가 덮지 못한 영역
 * (상태바+내비바) 중 상태바 몫을 더해 보정한다. 상태바는 최소 24dp 라 24 로 잡으면 넘쳐서
 * 배너를 가리는 일은 없다(광고 가림은 AdMob 정책 위반).
 */
function heightAboveBanner(): number {
  const uncovered = window.screen.height - window.innerHeight;
  const topOffset = uncovered > 8 ? Math.min(24, uncovered) : 0;
  const bannerTop = topOffset + window.innerHeight - safeInset('bottom') - adStateManager.getBannerHeight();
  return Math.floor(bannerTop) - 1; // dp→px 반올림으로 배너에 1px 겹치는 것 방지
}

/**
 * iframe 으로 띄울 수 없는 글(X-Frame-Options/프레임버스터 사이트)이나
 * "브라우저로 열기"를 처리한다.
 *
 * - 네이티브 앱: 네이티브 인앱 브라우저로 연다. iframe 이 아니라 최상위 WebView 라
 *   XFO 제약을 받지 않고, 닫으면 바로 앱 목록으로 돌아온다.
 *   (window.open 은 Custom Tabs/외부 브라우저로 앱을 벗어나게 만들어 이탈로 이어진다)
 * - 웹: 새 탭.
 */
export async function openExternal(url: string, { title, color }: OpenOptions = {}) {
  if (!Capacitor.isNativePlatform()) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  try {
    const { InAppBrowser } = await import('@capgo/inappbrowser');
    await InAppBrowser.openWebView({
      url,
      title: title ?? '',
      toolbarColor: color ?? '#ffffff',
      toolbarTextColor: color ? '#ffffff' : '#000000',
      showReloadButton: true,
      ...(adStateManager.getAdLoaded() && { height: heightAboveBanner() }),
    });
  } catch {
    window.open(url, '_blank');
  }
}
