/**
 * GA4 이벤트 전송. NEXT_PUBLIC_GA_ID 가 없으면 아무것도 하지 않는다.
 * 리텐션/이탈은 GA4 기본 지표(재방문, 참여 시간)로 보고,
 * 여기서는 "글을 열었는데 어떻게 열렸는지"처럼 이탈 원인을 가를 이벤트만 보낸다.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Params = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: Params = {}) {
  if (!GA_ID || typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', event, params);
}
