/**
 * 빌드 전 데이터 준비 스크립트
 *
 * data/posts.json (전체, ~4MB) 을 그대로 클라이언트에 직렬화하면
 * 홈 HTML 이 3.7MB 가 되므로, 아래 두 가지로 분리한다.
 *
 *  1. data/posts-initial.json / data/posts-hot.json
 *     → 첫 화면(SSR/SEO)용 상위 N건. 정적 HTML 에 인라인된다.
 *  2. public/data/posts-v2.json
 *     → 전체 목록의 압축(컬럼형) 페이로드. 마운트 후 fetch 로 가져온다.
 */
import fs from 'fs';
import path from 'path';
import type { StaticPost } from '../lib/types';
import { rankTrending } from '../lib/utils/ranking';

const ROOT = process.cwd();
const INITIAL_COUNT = 60;

const hotScore = (p: StaticPost) =>
  (p.viewCount || 0) * 0.1 + (p.commentCount || 0) * 5 + (p.likeCount || 0) * 2;

function main() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'posts.json'), 'utf-8')
  ) as StaticPost[];

  // 크롤 워크플로우 두 개가 겹치면 git 이 posts.json 을 줄 단위로 합쳐 같은 글이 두 번 들어갈 수 있다.
  // 다음 크롤에서 정리되지만, 그 사이 배포에 중복이 보이지 않도록 여기서도 걸러낸다.
  const seen = new Set<string>();
  const posts = raw.filter((p) => !seen.has(p.url) && !!seen.add(p.url));

  // ── 1. 첫 화면용 슬라이스 ────────────────────────────────
  // 홈 기본 정렬(실시간)과 같은 순서여야 첫 화면이 하이드레이션 후 뒤바뀌지 않는다.
  // 전체 페이로드와 같은 id(url)를 써야 하이드레이션 후 목록 교체 때 카드가 다시 마운트되지 않는다.
  const recent = rankTrending(posts).map((p) => ({ ...p, id: p.url }));
  const hot = [...recent].sort((a, b) => hotScore(b) - hotScore(a));

  writeJson('data/posts-initial.json', recent.slice(0, INITIAL_COUNT));
  writeJson('data/posts-hot.json', hot.slice(0, INITIAL_COUNT));

  // 첫 화면은 60건만 인라인되므로, 사이드바·게시글 수 같은 집계는 전체 기준으로 미리 계산해 둔다.
  // (안 그러면 전체 목록이 올 때까지 "더쿠 0", "7개 커뮤니티" 처럼 죽은 사이트로 보인다)
  const bySite: Record<string, number> = {};
  for (const p of posts) bySite[p.site] = (bySite[p.site] || 0) + 1;
  const generatedAt = new Date().toISOString();
  writeJson('data/posts-stats.json', {
    // 페이로드 URL 에 붙이는 빌드 버전. 같은 빌드의 HTML 과 페이로드를 짝지어
    // CDN 에 남은 이전 빌드 페이로드로 첫 화면 목록이 뒤바뀌는 일을 막는다.
    version: generatedAt,
    total: posts.length,
    hot: posts.filter((p) => (p.viewCount || 0) > 5000 || (p.commentCount || 0) > 100).length,
    bySite,
  });

  // ── 2. 전체 목록 압축 페이로드 ───────────────────────────
  const sites: string[] = [];
  const siteIdx = (name: string) => {
    let i = sites.indexOf(name);
    if (i === -1) { i = sites.length; sites.push(name); }
    return i;
  };

  // id 는 싣지 않는다 — 크롤마다 새로 발급돼 의미가 없고, 페이로드의 약 18%(br 기준)를 차지했다.
  // 클라이언트는 url 을 id 로 쓴다(북마크·읽음 표시도 url 기준).
  const rows = recent.map((p) => [
    p.title,
    p.author || '',
    p.url,
    siteIdx(p.site),
    p.viewCount || 0,
    p.commentCount || 0,
    p.likeCount || 0,
    Math.floor(new Date(p.createdAt).getTime() / 1000),
    p.category || '',
  ]);

  const payload = {
    v: 2,
    generatedAt,
    sites,
    rows,
  };

  fs.mkdirSync(path.join(ROOT, 'public', 'data'), { recursive: true });
  writeJson('public/data/posts-v2.json', payload);

  const full = fs.statSync(path.join(ROOT, 'data', 'posts.json')).size;
  const compact = fs.statSync(path.join(ROOT, 'public', 'data', 'posts-v2.json')).size;
  console.log(
    `[prepare-data] ${posts.length}건 · 원본 ${kb(full)} → 압축 ${kb(compact)} ` +
    `(초기 ${INITIAL_COUNT}건 인라인)`
  );
}

function writeJson(rel: string, data: unknown) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(data));
}

const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`;

main();
