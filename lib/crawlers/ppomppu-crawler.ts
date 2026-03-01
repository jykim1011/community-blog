import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class PpomppuCrawler extends BaseCrawler {
  siteName = 'ppomppu';
  private readonly baseUrl = 'https://www.ppomppu.co.kr';
  private readonly boardUrl = 'https://www.ppomppu.co.kr/zboard/zboard.php?id=freeboard';

  async crawl(): Promise<Post[]> {
    const allPosts: Post[] = [];
    const PAGES_TO_CRAWL = 5;

    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      for (let page = 1; page <= PAGES_TO_CRAWL; page++) {
        try {
          const pageUrl = this.getPageUrl(page);
          const posts = await this.crawlPage(pageUrl);

          if (posts.length === 0) {
            console.log(`[${this.siteName}] No more posts at page ${page}, stopping`);
            break;
          }

          allPosts.push(...posts);

          // 페이지 간 딜레이 (ppomppu는 2초 권장)
          if (page < PAGES_TO_CRAWL) {
            await this.delay(2000);
          }
        } catch (error) {
          if ((error as any).response?.status === 429) {
            console.warn(`[${this.siteName}] Rate limited at page ${page}, waiting 10 seconds...`);
            await this.delay(10000);
            page--;
            continue;
          }

          if ((error as any).response?.status === 404) {
            console.log(`[${this.siteName}] Page ${page} not found, stopping`);
            break;
          }

          console.error(`[${this.siteName}] Error at page ${page}:`, (error as Error).message);
          break;
        }
      }

      console.log(`[${this.siteName}] Crawled ${allPosts.length} posts`);
      return allPosts;
    } catch (error) {
      this.handleError(error, 'crawl');
      return allPosts;
    }
  }

  private getPageUrl(page: number): string {
    // ppomppu 페이지네이션: &page=1, &page=2
    return `${this.boardUrl}&page=${page}`;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: this.baseUrl,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const html = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    const $ = cheerio.load(html);
    const posts: Post[] = [];

    $('tr.baseList').each((_, element) => {
      try {
        const $el = $(element);

        // 공지/광고 스킵
        if ($el.hasClass('baseNotice')) return;

        const titleLink = $el.find('a.baseList-title').first();
        const title = titleLink.text().trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        const url = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${this.baseUrl}/zboard/${relativeUrl}`;

        const author = $el.find('a.baseList-name .list_name').text().trim() || '익명';
        const viewCount = parseInt($el.find('.baseList-views').text().trim().replace(/,/g, '')) || 0;
        const likeCount = parseInt($el.find('.baseList-rec').text().trim()) || 0;
        const timeText = $el.find('time.baseList-time').text().trim();
        const createdAt = this.parseDate(timeText);

        // 썸네일 이미지
        const thumbnailElement = $el.find('img').first();
        const thumbnailSrc = thumbnailElement.attr('data-src') || thumbnailElement.attr('src');
        const thumbnail = thumbnailSrc && thumbnailSrc.startsWith('http')
          ? thumbnailSrc
          : thumbnailSrc
          ? `${this.baseUrl}${thumbnailSrc}`
          : undefined;

        posts.push({
          id: '',
          title,
          author,
          site: this.siteName,
          url,
          viewCount,
          commentCount: 0,
          likeCount,
          createdAt,
          fetchedAt: new Date(),
          thumbnail,
        });
      } catch (error) {
        this.handleError(error, 'parsing post');
      }
    });

    return posts;
  }

  private parseDate(timeText: string): Date {
    const now = new Date();

    // HH:MM:SS
    if (timeText.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes, seconds] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, seconds, 0);
      return date;
    }

    // YY/MM/DD
    if (timeText.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const [year, month, day] = timeText.split('/').map(Number);
      return new Date(2000 + year, month - 1, day);
    }

    return now;
  }
}
