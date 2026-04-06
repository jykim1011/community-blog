import type { StaticPost } from '@/lib/types';

export interface DailyTrend {
  date: string; // YYYY-MM-DD
  postCount: number;
  avgViewCount: number;
  avgCommentCount: number;
  avgLikeCount: number;
  topKeyword: string;
}

export interface HourlyTrend {
  hour: number; // 0-23
  postCount: number;
}

export interface SiteTrend {
  siteName: string;
  displayName: string;
  postCount: number;
  avgViewCount: number;
  avgCommentCount: number;
  avgLikeCount: number;
  topPost: {
    id: string;
    title: string;
    url: string;
    score: number;
  } | null;
}

/**
 * 일별 트렌드 분석 (최근 N일)
 */
export function analyzeDailyTrends(posts: StaticPost[], days: number = 7): DailyTrend[] {
  const now = new Date();
  const trends = new Map<string, StaticPost[]>();

  // 날짜별로 그룹화
  for (const post of posts) {
    const postDate = new Date(post.createdAt);
    const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= days) continue;

    const dateKey = postDate.toISOString().split('T')[0];
    if (!trends.has(dateKey)) {
      trends.set(dateKey, []);
    }
    trends.get(dateKey)!.push(post);
  }

  // 통계 계산
  const results: DailyTrend[] = [];
  for (const [date, dayPosts] of trends.entries()) {
    const totalViews = dayPosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const totalComments = dayPosts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
    const totalLikes = dayPosts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

    // 가장 많이 등장한 키워드
    const wordCount = new Map<string, number>();
    for (const post of dayPosts) {
      const words = post.title.match(/[가-힣]{2,}/g) || [];
      for (const word of words) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    }
    const topKeyword = Array.from(wordCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    results.push({
      date,
      postCount: dayPosts.length,
      avgViewCount: Math.round(totalViews / dayPosts.length),
      avgCommentCount: Math.round(totalComments / dayPosts.length),
      avgLikeCount: Math.round(totalLikes / dayPosts.length),
      topKeyword,
    });
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 시간대별 트렌드 분석
 */
export function analyzeHourlyTrends(posts: StaticPost[]): HourlyTrend[] {
  const hourCounts = new Array(24).fill(0);

  for (const post of posts) {
    const hour = new Date(post.createdAt).getHours();
    hourCounts[hour]++;
  }

  return hourCounts.map((count, hour) => ({ hour, postCount: count }));
}

/**
 * 사이트별 트렌드 분석
 */
export function analyzeSiteTrends(posts: StaticPost[], sites: { name: string; displayName: string }[]): SiteTrend[] {
  const siteMap = new Map(sites.map(s => [s.name, s.displayName]));
  const siteGroups = new Map<string, StaticPost[]>();

  // 사이트별로 그룹화
  for (const post of posts) {
    if (!siteGroups.has(post.site)) {
      siteGroups.set(post.site, []);
    }
    siteGroups.get(post.site)!.push(post);
  }

  const results: SiteTrend[] = [];

  for (const [siteName, sitePosts] of siteGroups.entries()) {
    const totalViews = sitePosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const totalComments = sitePosts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
    const totalLikes = sitePosts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

    // 가장 인기 있는 게시글 (종합 점수)
    const postsWithScore = sitePosts.map(p => ({
      ...p,
      score: (p.viewCount || 0) * 0.1 + (p.commentCount || 0) * 5 + (p.likeCount || 0) * 2,
    }));
    postsWithScore.sort((a, b) => b.score - a.score);
    const topPost = postsWithScore[0];

    results.push({
      siteName,
      displayName: siteMap.get(siteName) || siteName,
      postCount: sitePosts.length,
      avgViewCount: Math.round(totalViews / sitePosts.length),
      avgCommentCount: Math.round(totalComments / sitePosts.length),
      avgLikeCount: Math.round(totalLikes / sitePosts.length),
      topPost: topPost ? {
        id: topPost.id,
        title: topPost.title,
        url: topPost.url,
        score: topPost.score,
      } : null,
    });
  }

  return results.sort((a, b) => b.postCount - a.postCount);
}

/**
 * 전체 통계 요약
 */
export interface OverallStats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  avgViewsPerPost: number;
  avgCommentsPerPost: number;
  avgLikesPerPost: number;
  mostActiveSite: string;
  mostActiveHour: number;
  engagementRate: number; // 댓글+좋아요 / 조회수
}

export function calculateOverallStats(posts: StaticPost[]): OverallStats {
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

  // 가장 활발한 사이트
  const siteCounts = new Map<string, number>();
  for (const post of posts) {
    siteCounts.set(post.site, (siteCounts.get(post.site) || 0) + 1);
  }
  const mostActiveSite = Array.from(siteCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // 가장 활발한 시간대
  const hourlyTrends = analyzeHourlyTrends(posts);
  const mostActiveHour = hourlyTrends.sort((a, b) => b.postCount - a.postCount)[0]?.hour || 0;

  return {
    totalPosts: posts.length,
    totalViews,
    totalComments,
    totalLikes,
    avgViewsPerPost: Math.round(totalViews / posts.length),
    avgCommentsPerPost: Math.round(totalComments / posts.length),
    avgLikesPerPost: Math.round(totalLikes / posts.length),
    mostActiveSite,
    mostActiveHour,
    engagementRate: totalViews > 0 ? (totalComments + totalLikes) / totalViews : 0,
  };
}
