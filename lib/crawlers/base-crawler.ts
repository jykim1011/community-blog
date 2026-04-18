import { type ICrawler, type Post } from '../types';
import { robotsChecker } from '../utils/robots-checker';

// 기본 크롤러 추상 클래스
export abstract class BaseCrawler implements ICrawler {
  abstract siteName: string;
  protected abstract baseUrl: string; // 각 크롤러에서 정의 필요

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

  // robots.txt 확인
  protected async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const canCrawl = await robotsChecker.canCrawl(url, 'CommunityBlogBot/1.0');
      if (!canCrawl) {
        console.warn(`[${this.siteName}] robots.txt disallows: ${url}`);
      }
      return canCrawl;
    } catch (error) {
      // 에러 시 허용 (보수적)
      console.warn(`[${this.siteName}] robots.txt check failed, allowing by default`);
      return true;
    }
  }

  // robots.txt의 Crawl-Delay 가져오기
  protected async getCrawlDelay(): Promise<number | undefined> {
    try {
      return await robotsChecker.getCrawlDelay(this.baseUrl, 'CommunityBlogBot/1.0');
    } catch (error) {
      return undefined;
    }
  }
}
