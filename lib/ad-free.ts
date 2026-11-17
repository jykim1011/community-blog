// 보상형 광고를 보면 일정 시간 배너를 끈다 ("광고 1편 보고 24시간 배너 없이 보기").
// 강제 노출이 아니라 사용자가 고르는 광고라 이탈 위험 없이 단가 높은 노출을 얻는다.
// AdMob 플러그인을 import 하지 않으므로 웹 번들에서도 안전하게 쓸 수 있다.

// 보상형 광고 단위 ID. AdMob 콘솔에서 '보상형' 단위를 만든 뒤 여기에 넣는다.
// 비어 있으면 설정 화면의 버튼이 나타나지 않는다.
export const REWARDED_AD_UNIT = 'ca-app-pub-4710152968528474/4408417126'; // community-rewarded-adfree

export const AD_FREE_HOURS = 24;

const KEY = 'adFreeUntil';
const EVENT = 'adfree-change';
// 저장소를 못 쓰는 환경에서도 이번 실행 동안은 유지되도록 메모리에도 둔다
let memoryUntil = 0;

export function getAdFreeUntil(): number {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Math.max(Number.isFinite(v) ? v : 0, memoryUntil);
  } catch {
    return memoryUntil;
  }
}

export function isAdFree(): boolean {
  return getAdFreeUntil() > Date.now();
}

export function grantAdFree(hours = AD_FREE_HOURS) {
  // 이미 광고 없는 시간이 남아 있으면 그 끝에서부터 늘린다
  const until = Math.max(getAdFreeUntil(), Date.now()) + hours * 3600_000;
  memoryUntil = until;
  try {
    localStorage.setItem(KEY, String(until));
  } catch {
    // 저장 못 해도 memoryUntil 로 이번 실행 동안은 유지된다
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: until }));
}

export function subscribeAdFree(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
