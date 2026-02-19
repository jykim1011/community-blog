import { ClienCrawler } from './clien-crawler';
import { TheQooCrawler } from './theqoo-crawler';
import { RuliwebCrawler } from './ruliweb-crawler';
import { DcinsideCrawler } from './dcinside-crawler';
import { InvenCrawler } from './inven-crawler';
import { PpomppuCrawler } from './ppomppu-crawler';
import { MlbparkCrawler } from './mlbpark-crawler';
import { NatepannCrawler } from './natepann-crawler';
import { IlbeCrawler } from './ilbe-crawler';
import { BobaedreamCrawler } from './bobaedream-crawler';
import { EtolandCrawler } from './etoland-crawler';
import { HumorunivCrawler } from './humoruniv-crawler';
import { Cook82Crawler } from './cook82-crawler';
import { SlrclubCrawler } from './slrclub-crawler';
import { GasengiCrawler } from './gasengi-crawler';
import { HygallCrawler } from './hygall-crawler';
import { TodayhumorCrawler } from './todayhumor-crawler';
import type { ICrawler } from '../types';

// 사용 가능한 모든 크롤러 등록
export const crawlers: Record<string, ICrawler> = {
  clien: new ClienCrawler(),
  theqoo: new TheQooCrawler(),
  ruliweb: new RuliwebCrawler(),
  dcinside: new DcinsideCrawler(),
  inven: new InvenCrawler(),
  ppomppu: new PpomppuCrawler(),
  mlbpark: new MlbparkCrawler(),
  natepann: new NatepannCrawler(),
  ilbe: new IlbeCrawler(),
  bobaedream: new BobaedreamCrawler(),
  etoland: new EtolandCrawler(),
  humoruniv: new HumorunivCrawler(),
  cook82: new Cook82Crawler(),
  slrclub: new SlrclubCrawler(),
  gasengi: new GasengiCrawler(),
  hygall: new HygallCrawler(),
  todayhumor: new TodayhumorCrawler(),
};

// 차단/접근불가 사이트 (향후 재활성화 가능):
// - fmkorea: HTTP 430 레이트리밋
// - arca: HTTP 403 Cloudflare 차단
// - damoang: HTTP 403 차단
// - orbi: SPA(Angular) 기반, 서버사이드 렌더링 없음
// - instiz: SSL/TLS 호환 문제

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
