import { SiteCategory } from '@/lib/constants';

// 게시글 타입
export interface Post {
  id: string;
  title: string;
  author: string;
  site: string;
  url: string;
  thumbnail?: string;
  viewCount?: number;
  commentCount?: number;
  likeCount?: number;
  createdAt: Date;
  fetchedAt: Date;
  category?: string;
}

// 사이트 정보 타입
export interface Site {
  id: string;
  name: string;
  displayName: string;
  url: string;
  logo?: string;
  crawlInterval: number; // 분 단위
  isActive: boolean;
  lastCrawledAt?: Date;
}

// 크롤러 인터페이스
export interface ICrawler {
  siteName: string;
  crawl(): Promise<Post[]>;
}

// 정적 JSON용 게시글 타입 (DB 없이 사용)
export interface StaticPost {
  id: string;
  title: string;
  author: string;
  url: string;
  site: string;
  siteDisplayName: string;
  siteCategory: SiteCategory; // 사이트 카테고리 (community, hotdeal, movie, game)
  thumbnail?: string;
  viewCount?: number;
  commentCount?: number;
  likeCount?: number;
  createdAt: string; // ISO string
  fetchedAt: string; // ISO string
  category?: string; // 게시판 카테고리 (이슈, 유머 등)
}

// 정적 JSON용 사이트 타입
/** 빌드 시 전체 게시글로 미리 계산한 집계 (scripts/prepare-data.ts) */
export interface PostsStats {
  /** 빌드 시 페이로드 생성 시각. 페이로드 URL 의 캐시 키로 쓴다. */
  version: string;
  total: number;
  hot: number;
  bySite: Record<string, number>;
}

export interface StaticSite {
  name: string;
  displayName: string;
  url: string;
  category: SiteCategory;
  lastCrawledAt: string | null; // ISO string
}
