import type { StaticPost } from '@/lib/types';

/**
 * "실시간" 피드 랭킹.
 *
 * 최신순은 막 올라와 반응이 없는 글(조회 수십, 댓글 0)로 첫 화면이 채워지고,
 * 글이 빨리 올라오는 한두 사이트가 화면을 독점한다. 그래서
 *  1. 반응도(댓글·추천·조회)를 사이트 안에서의 백분위로 정규화하고
 *     (사이트마다 조회수 스케일이 수십 배 다르다)
 *  2. 시간이 지날수록 감쇠시킨 뒤
 *  3. 같은 사이트가 연달아/몰려서 나오지 않게 섞는다.
 */

const DIVERSIFY_LIMIT = 300;   // 다양성 재배치를 적용할 상위 개수
const DIVERSIFY_WINDOW = 10;   // 최근 N개 안에서
const DIVERSIFY_MAX_PER_SITE = 3; // 같은 사이트는 최대 이만큼

const engagement = (p: StaticPost) =>
  (p.commentCount || 0) * 3 + (p.likeCount || 0) * 2 + Math.sqrt(p.viewCount || 0);

/**
 * @param now 기준 시각. 기본값은 목록에서 가장 최신 글 시각 — 빌드(SSR)와 클라이언트가
 *            같은 순서를 내야 하이드레이션이 어긋나지 않으므로 현재 시각을 쓰지 않는다.
 */
export function rankTrending(posts: StaticPost[], now?: number): StaticPost[] {
  if (now === undefined) {
    now = 0;
    for (const p of posts) now = Math.max(now, new Date(p.createdAt).getTime());
  }
  const base = now;

  // 1. 사이트 내 백분위
  const bySite = new Map<string, StaticPost[]>();
  for (const p of posts) {
    const list = bySite.get(p.site);
    if (list) list.push(p); else bySite.set(p.site, [p]);
  }
  const pct = new Map<StaticPost, number>();
  for (const list of bySite.values()) {
    const sorted = [...list].sort((a, b) => engagement(a) - engagement(b));
    sorted.forEach((p, i) => pct.set(p, sorted.length > 1 ? i / (sorted.length - 1) : 0.5));
  }

  // 2. 시간 감쇠
  const score = (p: StaticPost) => {
    const ageHours = Math.max(0, (base - new Date(p.createdAt).getTime()) / 36e5);
    return Math.pow(pct.get(p) ?? 0, 3) / Math.pow(ageHours + 4, 0.9);
  };
  const scored = posts.map(p => ({ p, s: score(p) })).sort((a, b) => b.s - a.s).map(x => x.p);

  // 3. 사이트 다양성
  const pool = scored.slice(0, DIVERSIFY_LIMIT);
  const out: StaticPost[] = [];
  while (pool.length) {
    const recent = out.slice(-DIVERSIFY_WINDOW);
    const last = out[out.length - 1];
    let i = pool.findIndex(p =>
      p.site !== last?.site &&
      recent.filter(x => x.site === p.site).length < DIVERSIFY_MAX_PER_SITE
    );
    if (i < 0) i = 0;
    out.push(pool.splice(i, 1)[0]);
  }
  return out.concat(scored.slice(DIVERSIFY_LIMIT));
}
