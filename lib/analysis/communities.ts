import type { StaticPost } from '@/lib/types';

export interface CommunityProfile {
  name: string;
  displayName: string;
  description: string;
  category: string;
  primaryTopics: string[];
  postCount: number;
  avgViewCount: number;
  avgCommentCount: number;
  avgLikeCount: number;
  activityScore: number; // 종합 활동 점수
  topPosts: {
    id: string;
    title: string;
    url: string;
    score: number;
  }[];
  peakHours: number[]; // 가장 활발한 시간대 TOP 3
}

// 커뮤니티 메타데이터
const COMMUNITY_META: Record<string, { description: string; category: string; topics: string[] }> = {
  clien: {
    description: 'IT, 가전, 자동차 등 실생활 정보 공유 커뮤니티',
    category: 'IT/테크',
    topics: ['IT', '가전', '자동차', '모니터', '노트북', '스마트폰'],
  },
  theqoo: {
    description: '연예, 아이돌 팬덤 중심의 여초 커뮤니티',
    category: '연예/팬덤',
    topics: ['아이돌', '연예인', '드라마', '음악', '방송', 'K-POP'],
  },
  ruliweb: {
    description: '게임, 애니메이션, 만화 등 서브컬처 종합 커뮤니티',
    category: '게임/서브컬처',
    topics: ['게임', '애니메이션', '만화', '콘솔', 'PC게임', '모바일게임'],
  },
  dcinside: {
    description: '다양한 주제의 갤러리 기반 익명 커뮤니티',
    category: '종합',
    topics: ['정치', '사회', '게임', '스포츠', '유머', '일상'],
  },
  inven: {
    description: '게임 전문 뉴스 및 커뮤니티',
    category: '게임',
    topics: ['LOL', '와우', '디아블로', '검은사막', '로스트아크', 'FPS'],
  },
  ppomppu: {
    description: '쇼핑, 할인 정보, 실생활 정보 공유 커뮤니티',
    category: '생활/쇼핑',
    topics: ['할인', '쇼핑', '테크딜', '해외직구', '중고거래', '가격비교'],
  },
  mlbpark: {
    description: '야구 팬 커뮤니티, 불펜 자유게시판 활발',
    category: '스포츠',
    topics: ['야구', 'MLB', 'KBO', '스포츠', '축구', '농구'],
  },
  natepann: {
    description: '네이트 판 익명 게시판, 연예/일상 토론',
    category: '종합',
    topics: ['연예', '일상', '썰', '고민', '관계', '직장'],
  },
  ilbe: {
    description: '일간베스트 저장소, 극우 성향 커뮤니티',
    category: '정치/유머',
    topics: ['정치', '유머', '시사', '사진', '짤방', '밈'],
  },
  bobaedream: {
    description: '자동차 전문 커뮤니티 및 중고차 거래',
    category: '자동차',
    topics: ['자동차', '중고차', '신차', '튜닝', '정비', '자동차뉴스'],
  },
  etoland: {
    description: '주식, 부동산, 재테크 정보 공유 커뮤니티',
    category: '재테크',
    topics: ['주식', '부동산', '경제', '재테크', '투자', '금융'],
  },
  humoruniv: {
    description: '유머, 웃긴 자료 공유 커뮤니티',
    category: '유머',
    topics: ['유머', '짤방', '웃긴글', '개그', '밈', '썰'],
  },
  cook82: {
    description: '여성 중심 생활 정보 커뮤니티',
    category: '생활/육아',
    topics: ['육아', '요리', '살림', '시댁', '결혼', '학부모'],
  },
  slrclub: {
    description: '사진, 카메라 동호회 커뮤니티',
    category: '사진/취미',
    topics: ['사진', '카메라', '렌즈', '여행', '풍경', '인물사진'],
  },
  gasengi: {
    description: '역사, 정치, 사회 이슈 토론 커뮤니티',
    category: '정치/역사',
    topics: ['역사', '정치', '국제정세', '군사', '사회', '시사'],
  },
  hygall: {
    description: '해외 축구 갤러리, 축구 팬 커뮤니티',
    category: '스포츠',
    topics: ['해외축구', '프리미어리그', '라리가', 'EPL', '챔스', '월드컵'],
  },
  todayhumor: {
    description: '유머, 정치, 사회 이슈 종합 커뮤니티',
    category: '유머/정치',
    topics: ['유머', '정치', '베스트', '개드립', '시사', '썰'],
  },
};

/**
 * 커뮤니티별 프로필 분석
 */
export function analyzeCommunityProfiles(
  posts: StaticPost[],
  sites: { name: string; displayName: string }[]
): CommunityProfile[] {
  const siteMap = new Map(sites.map(s => [s.name, s.displayName]));
  const siteGroups = new Map<string, StaticPost[]>();

  // 사이트별로 그룹화
  for (const post of posts) {
    if (!siteGroups.has(post.site)) {
      siteGroups.set(post.site, []);
    }
    siteGroups.get(post.site)!.push(post);
  }

  const profiles: CommunityProfile[] = [];

  for (const [siteName, sitePosts] of siteGroups.entries()) {
    const meta = COMMUNITY_META[siteName] || {
      description: '커뮤니티 정보',
      category: '종합',
      topics: [],
    };

    // 통계 계산
    const totalViews = sitePosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const totalComments = sitePosts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
    const totalLikes = sitePosts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

    // 활동 점수 (게시글 수 * 평균 상호작용)
    const avgEngagement = (totalComments + totalLikes) / sitePosts.length;
    const activityScore = sitePosts.length * avgEngagement;

    // TOP 게시글 (종합 점수 기준)
    const postsWithScore = sitePosts.map(p => ({
      ...p,
      score: (p.viewCount || 0) * 0.1 + (p.commentCount || 0) * 5 + (p.likeCount || 0) * 2,
    }));
    postsWithScore.sort((a, b) => b.score - a.score);
    const topPosts = postsWithScore.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      score: p.score,
    }));

    // 시간대별 분포
    const hourCounts = new Array(24).fill(0);
    for (const post of sitePosts) {
      const hour = new Date(post.createdAt).getHours();
      hourCounts[hour]++;
    }
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(h => h.hour);

    profiles.push({
      name: siteName,
      displayName: siteMap.get(siteName) || siteName,
      description: meta.description,
      category: meta.category,
      primaryTopics: meta.topics,
      postCount: sitePosts.length,
      avgViewCount: Math.round(totalViews / sitePosts.length),
      avgCommentCount: Math.round(totalComments / sitePosts.length),
      avgLikeCount: Math.round(totalLikes / sitePosts.length),
      activityScore,
      topPosts,
      peakHours,
    });
  }

  return profiles.sort((a, b) => b.activityScore - a.activityScore);
}

/**
 * 커뮤니티 카테고리별 그룹화
 */
export function groupCommunitiesByCategory(profiles: CommunityProfile[]): Record<string, CommunityProfile[]> {
  const groups: Record<string, CommunityProfile[]> = {};

  for (const profile of profiles) {
    if (!groups[profile.category]) {
      groups[profile.category] = [];
    }
    groups[profile.category].push(profile);
  }

  return groups;
}
