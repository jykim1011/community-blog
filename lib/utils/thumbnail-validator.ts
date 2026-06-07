// 목록 페이지에서 잘못 추출되는 아이콘·레벨 뱃지 패턴
const ICON_PATTERNS = [
  /\/images\/icon_/i,           // ppomppu 카테고리 아이콘
  /\/board\/level\//i,          // bobaedream 레벨 뱃지
  /ic_li_img/i,                 // slrclub 목록 아이콘
  /\/img\/icons\//i,            // gasengi 레벨 아이콘
  /\/box\/izy\.png/i,           // hygall 뱃지
  /\/modules\/point\/icons\//i, // extmovie 포인트 아이콘
  /xeicon_/i,                   // XE 아이콘 시스템
];

export function isValidPostThumbnail(url: string | undefined | null): boolean {
  if (!url) return false;
  return !ICON_PATTERNS.some(p => p.test(url));
}
