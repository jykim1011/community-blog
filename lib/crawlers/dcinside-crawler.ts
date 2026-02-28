import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class DcinsideCrawler extends BaseCrawler {
  siteName = 'dcinside';
  private readonly baseUrl = 'https://gall.dcinside.com';
  private readonly boardUrl = 'https://gall.dcinside.com/board/lists/?id=dcbest';

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

          if (page < PAGES_TO_CRAWL) {
            await this.delay(1000);
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
    // dcinside 페이지네이션: &page=1, &page=2
    return `${this.boardUrl}&page=${page}`;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: this.baseUrl,
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const posts: Post[] = [];

    $('tr.ub-content.us-post').each((_, element) => {
      try {
        const $el = $(element);

        const titleLink = $el.find('td.gall_tit a').first();
        const title = titleLink.text().trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        const url = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${this.baseUrl}${relativeUrl}`;

        const author = $el.find('td.gall_writer .nickname').text().trim() || '익명';
        const viewCount = parseInt($el.find('td.gall_count').text().trim()) || 0;
        const likeCount = parseInt($el.find('td.gall_recommend').text().trim()) || 0;
        const replyText = $el.find('td.gall_tit .reply_num').text().trim();
        const commentCount = parseInt(replyText.replace(/[\[\]]/g, '')) || 0;
        const timeText = $el.find('td.gall_date').attr('title') || $el.find('td.gall_date').text().trim();
        const createdAt = this.parseDate(timeText);

        posts.push({
          id: '',
          title,
          author,
          site: this.siteName,
          url,
          viewCount,
          commentCount,
          likeCount,
          createdAt,
          fetchedAt: new Date(),
        });
      } catch (error) {
        this.handleError(error, 'parsing post');
      }
    });

    return posts;
  }

  private parseDate(timeText: string): Date {
    const now = new Date();

    // "YYYY-MM-DD HH:MM:SS" 형식
    if (timeText.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return new Date(timeText);
    }

    // "HH:MM" 형식
    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // "MM.DD" 형식
    if (timeText.match(/^\d{2}\.\d{2}$/)) {
      const [month, day] = timeText.split('.').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    return now;
  }
}
