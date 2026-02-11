import cron from 'node-cron';
import { getAllCrawlers } from '../crawlers';
import { postService } from '../db/post-service';

let currentIndex = 0;
let isRunning = false;

async function crawlNext() {
  if (isRunning) {
    console.log('[auto-crawl] Previous crawl still running, skipping...');
    return;
  }

  const crawlers = getAllCrawlers();
  if (crawlers.length === 0) return;

  isRunning = true;
  const crawler = crawlers[currentIndex % crawlers.length];

  try {
    console.log(`[auto-crawl] Crawling ${crawler.siteName}...`);
    const posts = await crawler.crawl();

    if (posts.length > 0) {
      const result = await postService.savePosts(posts);
      console.log(`[auto-crawl] ${crawler.siteName}: saved ${result.saved}, skipped ${result.skipped}`);
    }
  } catch (error) {
    console.error(`[auto-crawl] Failed to crawl ${crawler.siteName}:`, error);
  } finally {
    currentIndex++;
    isRunning = false;
  }
}

export function startAutoCrawl() {
  // 서버 시작 후 10초 뒤 첫 크롤링 (초기 데이터 확보)
  setTimeout(() => {
    console.log('[auto-crawl] Initial crawl starting...');
    crawlNext();
  }, 10_000);

  // 5분마다 다음 사이트 크롤링 (사이트 3개 → 각 사이트 15분 주기)
  cron.schedule('*/5 * * * *', () => {
    crawlNext();
  });

  console.log('[auto-crawl] Scheduled: every 5 min, rotating across sites');
}
