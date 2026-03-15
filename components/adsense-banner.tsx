'use client';

import { useEffect } from 'react';

interface AdSenseBannerProps {
  /**
   * AdSense 광고 슬롯 ID
   * 예: "1234567890"
   */
  adSlot: string;

  /**
   * 광고 형식
   * - 'auto': 자동 크기 (반응형)
   * - 'horizontal': 가로형 배너 (728x90, 468x60)
   * - 'vertical': 세로형 배너 (120x600, 160x600)
   * - 'rectangle': 직사각형 (300x250, 336x280)
   */
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';

  /**
   * 광고 레이아웃 키 (반응형 광고인 경우)
   */
  adLayoutKey?: string;

  /**
   * 전체 너비 반응형 광고 여부
   */
  fullWidthResponsive?: boolean;

  /**
   * 커스텀 클래스명
   */
  className?: string;
}

/**
 * Google AdSense 배너 광고 컴포넌트
 *
 * 사용법:
 * <AdSenseBanner
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   fullWidthResponsive
 * />
 */
export function AdSenseBanner({
  adSlot,
  adFormat = 'auto',
  adLayoutKey,
  fullWidthResponsive = true,
  className = '',
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // AdSense 광고 로드
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // AdSense 클라이언트 ID가 없으면 아무것도 표시하지 않음
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

/**
 * 반응형 디스플레이 광고 (가장 일반적)
 */
export function AdSenseResponsive({
  adSlot,
  className
}: {
  adSlot: string;
  className?: string;
}) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="auto"
      fullWidthResponsive
      className={className}
    />
  );
}

/**
 * 인피드 광고 (게시글 사이)
 */
export function AdSenseInFeed({
  adSlot,
  adLayoutKey,
  className
}: {
  adSlot: string;
  adLayoutKey?: string;
  className?: string;
}) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="auto"
      adLayoutKey={adLayoutKey}
      fullWidthResponsive
      className={className}
    />
  );
}

/**
 * 인아티클 광고 (콘텐츠 내부)
 */
export function AdSenseInArticle({
  adSlot,
  className
}: {
  adSlot: string;
  className?: string;
}) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="auto"
      fullWidthResponsive
      className={className}
    />
  );
}
