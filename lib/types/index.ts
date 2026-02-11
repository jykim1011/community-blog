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

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
