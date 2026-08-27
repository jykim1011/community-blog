/**
 * 빌드 전 데이터 준비 스크립트
 *
 * data/posts.json (전체, ~4MB) 을 그대로 클라이언트에 직렬화하면
 * 홈 HTML 이 3.7MB 가 되므로, 아래 두 가지로 분리한다.
 *
 *  1. data/posts-initial.json / data/posts-hot.json
 *     → 첫 화면(SSR/SEO)용 상위 N건. 정적 HTML 에 인라인된다.
 *  2. public/data/posts.json
 *     → 전체 목록의 압축(컬럼형) 페이로드. 마운트 후 fetch 로 가져온다.
 */
import fs from 'fs';
import path from 'path';
import type { StaticPost } from '../lib/types';

const ROOT = process.cwd();
const INITIAL_COUNT = 60;

const hotScore = (p: StaticPost) =>
  (p.viewCount || 0) * 0.1 + (p.commentCount || 0) * 5 + (p.likeCount || 0) * 2;

function main() {
  const posts = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'posts.json'), 'utf-8')
  ) as StaticPost[];

  // ── 1. 첫 화면용 슬라이스 ────────────────────────────────
  const recent = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const hot = [...posts].sort((a, b) => hotScore(b) - hotScore(a));

  writeJson('data/posts-initial.json', recent.slice(0, INITIAL_COUNT));
  writeJson('data/posts-hot.json', hot.slice(0, INITIAL_COUNT));

  // ── 2. 전체 목록 압축 페이로드 ───────────────────────────
  const sites: string[] = [];
  const siteIdx = (name: string) => {
    let i = sites.indexOf(name);
    if (i === -1) { i = sites.length; sites.push(name); }
    return i;
  };

  const rows = recent.map((p) => [
    p.id,
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
    v: 1,
    generatedAt: new Date().toISOString(),
    sites,
    rows,
  };

  fs.mkdirSync(path.join(ROOT, 'public', 'data'), { recursive: true });
  writeJson('public/data/posts.json', payload);

  const full = fs.statSync(path.join(ROOT, 'data', 'posts.json')).size;
  const compact = fs.statSync(path.join(ROOT, 'public', 'data', 'posts.json')).size;
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
