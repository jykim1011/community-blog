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
  thumbnail?: string;
  viewCount?: number;
  commentCount?: number;
  likeCount?: number;
  createdAt: string; // ISO string
  fetchedAt: string; // ISO string
  category?: string;
}

// 정적 JSON용 사이트 타입
export interface StaticSite {
  name: string;
  displayName: string;
  url: string;
  lastCrawledAt: string | null; // ISO string
}
