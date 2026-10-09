import { Capacitor } from '@capacitor/core';
import { AD_HEIGHT_NATIVE, adStateManager } from '@/lib/ad-state';

interface OpenOptions {
  /** 툴바에 표시할 제목 (사이트명) */
  title?: string;
  /** 툴바 색상 (사이트 브랜드 컬러) */
  color?: string;
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
    // 하단 AdMob 배너를 가리지 않도록 높이를 남긴다.
    const probe = document.createElement('div');
    probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    document.documentElement.appendChild(probe);
    const safeBottom = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    probe.remove();
    const reserved = adStateManager.getAdLoaded() ? AD_HEIGHT_NATIVE + Math.round(safeBottom) : 0;

    await InAppBrowser.openWebView({
      url,
      title: title ?? '',
      toolbarColor: color ?? '#ffffff',
      toolbarTextColor: color ? '#ffffff' : '#000000',
      showReloadButton: true,
      ...(reserved > 0 && { height: Math.round(window.innerHeight) - reserved }),
    });
  } catch {
    window.open(url, '_blank');
  }
}
