import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class Cook82Crawler extends BaseCrawler {
  siteName = 'cook82';
  private readonly baseUrl = 'https://www.82cook.com';
  private readonly boardUrl = 'https://www.82cook.com/entiz/enti.php?bn=15';

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

    $('#bbs table tbody tr').each((_, element) => {
      try {
        const $el = $(element);

        // 공지 스킵
        if ($el.hasClass('noticeList')) return;

        const titleLink = $el.find('td.title a').first();
        const title = titleLink.text().trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        const url = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${this.baseUrl}/entiz/${relativeUrl}`;

        const author = $el.find('td.user_function').text().trim() || '익명';
        // 마지막 td.numbers가 조회수
        const numbersTds = $el.find('td.numbers');
        const viewCount = parseInt($(numbersTds.last()).text().trim().replace(/,/g, '')) || 0;
        // 댓글 수는 제목 옆 <em> 태그
        const commentText = $el.find('td.title em').text().trim();
        const commentCount = parseInt(commentText) || 0;
        const timeText = $el.find('td.regdate').attr('title') || $el.find('td.regdate').text().trim();
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
          commentCount,
          likeCount: 0,
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

    // Full datetime: "2026-02-18 13:58:27"
    if (timeText.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return new Date(timeText);
    }

    // HH:MM:SS
    if (timeText.match(/^\s*\d{2}:\d{2}:\d{2}\s*$/)) {
      const [hours, minutes, seconds] = timeText.trim().split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, seconds, 0);
      return date;
    }

    if (timeText.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
