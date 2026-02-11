import { type ICrawler, type Post } from '../types';

// 기본 크롤러 추상 클래스
export abstract class BaseCrawler implements ICrawler {
  abstract siteName: string;

  // 크롤링 메서드 (각 사이트별로 구현)
  abstract crawl(): Promise<Post[]>;

  // Rate limiting을 위한 딜레이 함수
  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 에러 처리
  protected handleError(error: unknown, context: string): void {
    console.error(`[${this.siteName}] Error in ${context}:`, error);
  }

  // URL 유효성 검사
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
