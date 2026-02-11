import { ClienCrawler } from './clien-crawler';
import { TheQooCrawler } from './theqoo-crawler';
import { RuliwebCrawler } from './ruliweb-crawler';
import type { ICrawler } from '../types';

// 사용 가능한 모든 크롤러 등록
export const crawlers: Record<string, ICrawler> = {
  clien: new ClienCrawler(),
  theqoo: new TheQooCrawler(),
  ruliweb: new RuliwebCrawler(),
};

// 특정 사이트의 크롤러 가져오기
export function getCrawler(siteName: string): ICrawler | undefined {
  return crawlers[siteName];
}

// 모든 크롤러 목록
export function getAllCrawlers(): ICrawler[] {
  return Object.values(crawlers);
}

// 활성화된 모든 크롤러로 크롤링 실행
export async function crawlAllSites() {
  const results = await Promise.allSettled(
    getAllCrawlers().map((crawler) => crawler.crawl())
  );

  const posts = results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => (result as PromiseFulfilledResult<any>).value);

  return posts;
}
