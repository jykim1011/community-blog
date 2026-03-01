import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class GasengiCrawler extends BaseCrawler {
  siteName = 'gasengi';
  private readonly baseUrl = 'https://www.gasengi.com';
  private readonly boardUrl = 'https://www.gasengi.com/main/board.php?bo_table=commu08';

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
    if (page === 1) {
      return this.boardUrl;
    }
    return `${this.boardUrl}&page=${page}`;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const posts: Post[] = [];

    $('tbody tr').each((_, element) => {
      try {
        const $el = $(element);

        // 공지 스킵
        if ($el.hasClass('table-primary')) return;

        const titleLink = $el.find('td.text-start a.link-body-emphasis').first();
        const title = titleLink.text().trim();
        const url = titleLink.attr('href');

        if (!title || !url) return;

        const author = $el.find('td.d-none.d-md-table-cell .dropdown a.link-body-emphasis').first().text().trim() || '익명';
        // 조회수는 3번째 d-none td (첫번째는 번호, 두번째는 작성자 영역)
        const tds = $el.find('td.d-none.d-md-table-cell.small');
        const viewCount = parseInt($(tds[0]).text().trim().replace(/,/g, '')) || 0;
        const timeText = $(tds[1]).text().trim();

        // 댓글수는 모바일 영역에서
        const commentText = $el.find('li.list-inline-item .fa-commenting-o').parent().text().trim();
        const commentCount = parseInt(commentText) || 0;

        const createdAt = this.parseDate(timeText);

        posts.push({
          id: '',
          title,
          author,
          site: this.siteName,
          url,
          viewCount,
          commentCount,
          likeCount: 0,
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

    // "10:21" 형태 (오늘)
    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // "2019-04-05" 형태 (YYYY-MM-DD)
    if (timeText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(timeText);
    }

    // "02-19" 형태 (MM-DD, 올해)
    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      const date = new Date(now.getFullYear(), month - 1, day);

      // 만약 미래 날짜면 작년으로 설정
      if (date > now) {
        date.setFullYear(now.getFullYear() - 1);
      }

      return date;
    }

    return now;
  }
}
