import * as fs from 'fs';
import * as path from 'path';
import { crawlers } from '../lib/crawlers';
import { siteConfigs } from '../lib/constants';
import type { StaticPost, StaticSite } from '../lib/types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const SITES_FILE = path.join(DATA_DIR, 'sites.json');

const MAX_POSTS = 1000;
const MAX_AGE_HOURS = 72;

function readExistingPosts(): StaticPost[] {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    }
  } catch {
    console.warn('기존 posts.json 읽기 실패, 빈 배열로 시작');
  }
  return [];
}

function readExistingSites(): StaticSite[] {
  try {
    if (fs.existsSync(SITES_FILE)) {
      return JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
    }
  } catch {
    console.warn('기존 sites.json 읽기 실패, 빈 배열로 시작');
  }
  return [];
}

async function main() {
  const targetSite = process.argv[2];

  // 크롤링할 사이트 결정
  const sitesToCrawl = targetSite
    ? { [targetSite]: crawlers[targetSite] }
    : crawlers;

  if (targetSite && !crawlers[targetSite]) {
    console.error(`알 수 없는 사이트: ${targetSite}`);
    console.error(`사용 가능한 사이트: ${Object.keys(crawlers).join(', ')}`);
    process.exit(1);
  }

  // data 디렉토리 생성
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 기존 데이터 읽기
  const existingPosts = readExistingPosts();
  const existingSites = readExistingSites();
  const now = new Date();

  console.log(`기존 게시글: ${existingPosts.length}건`);
  console.log(`크롤링 대상: ${Object.keys(sitesToCrawl).join(', ')}`);

  // 크롤링 실행
  let newPosts: StaticPost[] = [];

  for (const [siteName, crawler] of Object.entries(sitesToCrawl)) {
    try {
      console.log(`[${siteName}] 크롤링 시작...`);
      const posts = await crawler.crawl();

      const config = siteConfigs[siteName] || { displayName: siteName, url: '' };
      const staticPosts: StaticPost[] = posts.map((post) => ({
        id: `${siteName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: post.title,
        author: post.author,
        url: post.url,
        site: siteName,
        siteDisplayName: config.displayName,
        thumbnail: post.thumbnail,
        viewCount: post.viewCount,
        commentCount: post.commentCount,
        likeCount: post.likeCount,
        createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date().toISOString(),
        fetchedAt: now.toISOString(),
        category: post.category,
      }));

      newPosts = newPosts.concat(staticPosts);
      console.log(`[${siteName}] ${staticPosts.length}건 크롤링 완료`);
    } catch (error) {
      console.error(`[${siteName}] 크롤링 실패:`, error);
    }
  }

  // 머지: URL 기준 중복 제거 (새 게시글 우선)
  const urlSet = new Set<string>();
  const merged: StaticPost[] = [];

  for (const post of [...newPosts, ...existingPosts]) {
    if (!urlSet.has(post.url)) {
      urlSet.add(post.url);
      merged.push(post);
    }
  }

  // 48시간 초과 삭제 (fetchedAt 기준 - 크롤링된 지 48시간 이내 유지)
  const cutoff = new Date(now.getTime() - MAX_AGE_HOURS * 60 * 60 * 1000);
  const filtered = merged.filter((post) => {
    const fetchedDate = new Date(post.fetchedAt);
    return fetchedDate > cutoff;
  });

  // 최신순 정렬 (fetchedAt 기준) → 최대 500건
  filtered.sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
  const final = filtered.slice(0, MAX_POSTS);

  // 저장
  fs.writeFileSync(POSTS_FILE, JSON.stringify(final, null, 2), 'utf-8');
  console.log(`\n저장 완료: ${final.length}건 (신규 ${newPosts.length}건, 제거 ${merged.length - final.length}건)`);

  // sites.json 업데이트
  const siteMap = new Map<string, StaticSite>();

  // 기존 사이트 정보 유지
  for (const site of existingSites) {
    siteMap.set(site.name, site);
  }

  // 크롤링한 사이트의 lastCrawledAt 업데이트
  for (const siteName of Object.keys(sitesToCrawl)) {
    const config = siteConfigs[siteName] || { displayName: siteName, url: '' };
    siteMap.set(siteName, {
      name: siteName,
      displayName: config.displayName,
      url: config.url,
      lastCrawledAt: now.toISOString(),
    });
  }

  // 등록된 모든 크롤러 사이트를 sites.json에 포함
  for (const siteName of Object.keys(crawlers)) {
    if (!siteMap.has(siteName)) {
      const config = siteConfigs[siteName] || { displayName: siteName, url: '' };
      siteMap.set(siteName, {
        name: siteName,
        displayName: config.displayName,
        url: config.url,
        lastCrawledAt: null,
      });
    }
  }

  const sites = Array.from(siteMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2), 'utf-8');
  console.log(`사이트 정보 업데이트: ${sites.length}개 사이트`);
}

main().catch((error) => {
  console.error('크롤링 스크립트 오류:', error);
  process.exit(1);
});
