/**
 * URL 정규화 유틸리티
 * 중복 방지를 위해 불필요한 파라미터를 제거하고 고유 식별자만 유지
 */

/**
 * 사이트별로 유지해야 할 파라미터 정의
 * 고유 식별자(id, no 등)만 유지하고 페이지네이션, 추적 파라미터 제거
 */
const SITE_ESSENTIAL_PARAMS: Record<string, string[]> = {
  clien: [], // URL 경로에 ID 포함 (/service/board/park/18969026)
  theqoo: ['bo_table', 'wr_id'], // 게시판 + 게시글 ID
  dcinside: ['id', 'no'], // 갤러리 ID + 게시글 번호
  ruliweb: ['num'], // 게시글 번호
  ppomppu: ['no'], // 게시글 번호
  mlbpark: ['b', 'id'], // 게시판 + ID
  natepann: ['s', 'n'], // 게시판 + 번호
  ilbe: ['no'], // 게시글 번호
  bobaedream: ['No'], // 게시글 번호 (대문자 주의!)
  etoland: ['no'], // 게시글 번호
  humoruniv: ['table', 'no'], // 게시판 + 번호
  cook82: ['no'], // 게시글 번호
  slrclub: ['id', 'no'], // 게시판 ID + 게시글 번호
  gasengi: ['bo_table', 'wr_id'], // 게시판 + 게시글 ID
  hygall: ['document_srl'], // 문서 일련번호
  todayhumor: ['no'], // 게시글 번호
  inven: [], // URL 경로에 ID 포함
  quasarzone: [], // URL 경로에 ID 포함 (/bbs/qb_saleinfo/views/12345)
  extmovie: [], // URL 경로에 ID 포함
  dvdprime: ['bo_table', 'wr_id'], // Gnuboard: 게시판 + 게시글 ID
  dealbada: ['bo_table', 'wr_id'], // Gnuboard: 게시판 + 게시글 ID
  coolenjoy: [], // URL 경로에 ID 포함
};

/**
 * URL 정규화
 * @param url 원본 URL
 * @param siteName 사이트 이름
 * @returns 정규화된 URL (고유 식별자만 포함)
 */
export function normalizeUrl(url: string, siteName: string): string {
  try {
    const urlObj = new URL(url);
    const essentialParams = SITE_ESSENTIAL_PARAMS[siteName] || [];

    // 파라미터가 필요한 경우
    if (essentialParams.length > 0) {
      const newSearchParams = new URLSearchParams();

      // 필수 파라미터만 유지
      essentialParams.forEach(param => {
        const value = urlObj.searchParams.get(param);
        if (value) {
          newSearchParams.set(param, value);
        }
      });

      // 정규화된 URL 생성 (파라미터 알파벳 순 정렬)
      const sortedParams = Array.from(newSearchParams.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      urlObj.search = new URLSearchParams(sortedParams).toString();
    } else {
      // 파라미터 불필요한 경우 (URL 경로에 ID 포함)
      urlObj.search = '';
    }

    // 해시 제거
    urlObj.hash = '';

    return urlObj.toString();
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    console.warn(`[${siteName}] URL 정규화 실패: ${url}`, error);
    return url;
  }
}

/**
 * 절대 URL로 변환
 * @param url 상대 또는 절대 URL
 * @param baseUrl 기본 URL
 * @returns 절대 URL
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  try {
    const base = new URL(baseUrl);
    const absolute = new URL(url, base);
    return absolute.toString();
  } catch (error) {
    // URL 변환 실패 시 baseUrl + url 반환
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }
}
