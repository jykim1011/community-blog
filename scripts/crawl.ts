import * as fs from 'fs';
import * as path from 'path';
import { crawlers } from '../lib/crawlers';
import { siteConfigs } from '../lib/constants';
import type { StaticPost, StaticSite } from '../lib/types';
import { analyzeKeywords } from '../lib/analysis/keywords';
import { analyzeDailyTrends, analyzeHourlyTrends, analyzeSiteTrends, calculateOverallStats } from '../lib/analysis/trends';
import { analyzeCommunityProfiles, groupCommunitiesByCategory } from '../lib/analysis/communities';

interface PopularityFilterConfig {
  minViewCount: number;
  minCommentCount: number;
  minLikeCount: number;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const SITES_FILE = path.join(DATA_DIR, 'sites.json');
const ANALYSIS_FILE = path.join(DATA_DIR, 'analysis.json');
const SITES_DIR = path.join(DATA_DIR, 'sites');

const MAX_POSTS = 7000;
const MAX_AGE_HOURS = 168;
const MAX_POSTS_PER_SITE = 1500; // 사이트별 최대 저장 개수
const MAX_CREATED_AGE_DAYS = 30; // createdAt 기준 최대 보관 기간 (미래 날짜도 제외)

// 인기 게시글 필터 기준 (OR 조건: 하나라도 만족하면 유지)
const POPULARITY_FILTER: PopularityFilterConfig = {
  minViewCount: 50,
  minCommentCount: 3,
  minLikeCount: 5,
};

// 환경 변수로 오버라이드 가능
const MIN_VIEW_COUNT = parseInt(process.env.MIN_VIEW_COUNT || String(POPULARITY_FILTER.minViewCount));
const MIN_COMMENT_COUNT = parseInt(process.env.MIN_COMMENT_COUNT || String(POPULARITY_FILTER.minCommentCount));
const MIN_LIKE_COUNT = parseInt(process.env.MIN_LIKE_COUNT || String(POPULARITY_FILTER.minLikeCount));

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

/**
 * 인기 게시글 필터링 함수
 * 조건: viewCount >= min OR commentCount >= min OR likeCount >= min
 * 메트릭이 null/undefined인 경우 0으로 간주
 */
function filterPopularPosts(posts: StaticPost[]): StaticPost[] {
  const filtered = posts.filter((post) => {
    const viewCount = post.viewCount ?? 0;
    const commentCount = post.commentCount ?? 0;
    const likeCount = post.likeCount ?? 0;

    // OR 조건: 하나라도 기준 이상이면 유지
    return (
      viewCount >= MIN_VIEW_COUNT ||
      commentCount >= MIN_COMMENT_COUNT ||
      likeCount >= MIN_LIKE_COUNT
    );
  });

  // 안전장치: 필터링 후 게시글이 0건이면 조회수 상위 100건 반환
  if (filtered.length === 0 && posts.length > 0) {
    console.warn('⚠️  모든 게시글이 필터링됨. 조회수 상위 100건을 반환합니다.');
    const sorted = [...posts].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    return sorted.slice(0, 100);
  }

  return filtered;
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

  // 크롤러별 타임아웃 (90초) - 개별 크롤러가 멈춰도 전체를 막지 않음
  const CRAWLER_TIMEOUT_MS = 60_000;

  async function crawlSite(siteName: string, crawler: (typeof sitesToCrawl)[string]): Promise<StaticPost[]> {
    const config = siteConfigs[siteName] || { displayName: siteName, url: '', category: 'community' as const };
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`타임아웃 (${CRAWLER_TIMEOUT_MS / 1000}s)`)), CRAWLER_TIMEOUT_MS)
    );
    try {
      console.log(`[${siteName}] 크롤링 시작...`);
      const posts = await Promise.race([crawler.crawl(), timeout]);
      const staticPosts: StaticPost[] = posts.map((post) => ({
        id: `${siteName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: post.title,
        author: post.author,
        url: post.url,
        site: siteName,
        siteDisplayName: config.displayName,
        siteCategory: config.category,
        thumbnail: post.thumbnail,
        viewCount: post.viewCount,
        commentCount: post.commentCount,
        likeCount: post.likeCount,
        createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date().toISOString(),
        fetchedAt: now.toISOString(),
        category: post.category,
      }));
      console.log(`[${siteName}] ${staticPosts.length}건 크롤링 완료`);
      return staticPosts;
    } catch (error) {
      console.error(`[${siteName}] 크롤링 실패:`, (error as Error).message);
      return [];
    }
  }

  // 모든 크롤러 병렬 실행
  const crawlResults = await Promise.allSettled(
    Object.entries(sitesToCrawl).map(([siteName, crawler]) => crawlSite(siteName, crawler))
  );

  const newPosts: StaticPost[] = crawlResults.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );

  // 머지: URL 기준 중복 제거 (새 게시글 우선)
  const urlSet = new Set<string>();
  const merged: StaticPost[] = [];

  for (const post of [...newPosts, ...existingPosts]) {
    if (!urlSet.has(post.url)) {
      urlSet.add(post.url);
      merged.push(post);
    }
  }

  // fetchedAt 기준: 크롤링된 지 MAX_AGE_HOURS 초과 삭제
  const cutoff = new Date(now.getTime() - MAX_AGE_HOURS * 60 * 60 * 1000);
  const ageFiltered = merged.filter((post) => {
    const fetchedDate = new Date(post.fetchedAt);
    return fetchedDate > cutoff;
  });

  // createdAt 기준: 30일 초과 오래된 게시글 및 미래 날짜 게시글 제거
  const createdAtCutoff = new Date(now.getTime() - MAX_CREATED_AGE_DAYS * 24 * 60 * 60 * 1000);
  const createdAtFiltered = ageFiltered.filter((post) => {
    const createdDate = new Date(post.createdAt);
    return createdDate > createdAtCutoff && createdDate <= now;
  });

  // 인기 게시글 필터링 적용
  const popularFiltered = filterPopularPosts(createdAtFiltered);

  // 사이트별로 그룹화하고 각 그룹 내에서 createdAt 정렬
  const groupedBySite = popularFiltered.reduce((acc, post) => {
    if (!acc[post.site]) acc[post.site] = [];
    acc[post.site].push(post);
    return acc;
  }, {} as Record<string, StaticPost[]>);

  // 각 사이트 내에서 createdAt 기준으로 최신순 정렬
  Object.values(groupedBySite).forEach(group => {
    group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // 라운드로빈 방식으로 사이트별로 하나씩 인터리빙 (완벽한 사이트 믹싱)
  const interleaved: StaticPost[] = [];
  const siteNames = Object.keys(groupedBySite);
  const maxLength = Math.max(...Object.values(groupedBySite).map(g => g.length));

  for (let i = 0; i < maxLength; i++) {
    for (const site of siteNames) {
      if (groupedBySite[site][i]) {
        interleaved.push(groupedBySite[site][i]);
      }
    }
  }

  const final = interleaved.slice(0, MAX_POSTS);

  // 사이트별 전체 데이터 저장 (구독 기능용)
  fs.mkdirSync(SITES_DIR, { recursive: true });

  for (const [siteName, posts] of Object.entries(groupedBySite)) {
    const siteData = {
      site: siteName,
      totalCount: posts.length,
      lastUpdated: now.toISOString(),
      posts: posts.slice(0, MAX_POSTS_PER_SITE),
    };

    const siteFile = path.join(SITES_DIR, `${siteName}.json`);
    fs.writeFileSync(siteFile, JSON.stringify(siteData, null, 2), 'utf-8');
  }

  console.log(`\n사이트별 데이터 저장: ${Object.keys(groupedBySite).length}개 파일`);

  // 메인 피드 저장 (라운드로빈 3000건)
  fs.writeFileSync(POSTS_FILE, JSON.stringify(final, null, 2), 'utf-8');

  // 통계 로그
  const removedByAge = merged.length - ageFiltered.length;
  const removedByCreatedAt = ageFiltered.length - createdAtFiltered.length;
  const removedByPopularity = createdAtFiltered.length - popularFiltered.length;
  const removedByLimit = popularFiltered.length - final.length;

  console.log(`\n저장 완료: ${final.length}건`);
  console.log(`  - 신규 크롤링: ${newPosts.length}건`);
  console.log(`  - 제거 (fetchedAt 만료): ${removedByAge}건`);
  console.log(`  - 제거 (createdAt 30일 초과/미래): ${removedByCreatedAt}건`);
  console.log(`  - 제거 (인기 부족): ${removedByPopularity}건`);
  console.log(`  - 제거 (개수 제한): ${removedByLimit}건`);
  console.log(`  - 필터 기준: 조회수>=${MIN_VIEW_COUNT} OR 댓글>=${MIN_COMMENT_COUNT} OR 좋아요>=${MIN_LIKE_COUNT}`);

  // sites.json 업데이트
  const siteMap = new Map<string, StaticSite>();

  // 기존 사이트 정보 유지
  for (const site of existingSites) {
    siteMap.set(site.name, site);
  }

  // 크롤링한 사이트의 lastCrawledAt 업데이트
  for (const siteName of Object.keys(sitesToCrawl)) {
    const config = siteConfigs[siteName] || { displayName: siteName, url: '', category: 'community' as const };
    siteMap.set(siteName, {
      name: siteName,
      displayName: config.displayName,
      url: config.url,
      category: config.category,
      lastCrawledAt: now.toISOString(),
    });
  }

  // 등록된 모든 크롤러 사이트를 sites.json에 포함
  for (const siteName of Object.keys(crawlers)) {
    if (!siteMap.has(siteName)) {
      const config = siteConfigs[siteName] || { displayName: siteName, url: '', category: 'community' as const };
      siteMap.set(siteName, {
        name: siteName,
        displayName: config.displayName,
        url: config.url,
        category: config.category,
        lastCrawledAt: null,
      });
    }
  }

  const sites = Array.from(siteMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2), 'utf-8');
  console.log(`사이트 정보 업데이트: ${sites.length}개 사이트`);

  // 분석 데이터 생성
  console.log('\n분석 데이터 생성 중...');
  const analysisStartTime = Date.now();

  const analysis = {
    generatedAt: now.toISOString(),
    keywords: analyzeKeywords(final, 30),
    dailyTrends: analyzeDailyTrends(final, 7),
    hourlyTrends: analyzeHourlyTrends(final),
    siteTrends: analyzeSiteTrends(final, sites),
    communityProfiles: analyzeCommunityProfiles(final, sites),
    categoryGroups: groupCommunitiesByCategory(analyzeCommunityProfiles(final, sites)),
    overallStats: calculateOverallStats(final),
  };

  fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');

  const analysisTime = ((Date.now() - analysisStartTime) / 1000).toFixed(2);
  console.log(`분석 완료: ${analysisTime}초`);
  console.log(`  - 키워드 ${analysis.keywords.length}개`);
  console.log(`  - 일별 트렌드 ${analysis.dailyTrends.length}일`);
  console.log(`  - 커뮤니티 프로필 ${analysis.communityProfiles.length}개`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('크롤링 스크립트 오류:', error);
    process.exit(1);
  });
