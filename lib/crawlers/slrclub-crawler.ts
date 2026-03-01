import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class SlrclubCrawler extends BaseCrawler {
  siteName = 'slrclub';
  private readonly baseUrl = 'https://www.slrclub.com';
  private readonly boardUrl = 'https://www.slrclub.com/bbs/zboard.php?id=free';

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
        if ($el.find('td.list_notice').length > 0) return;
        // 번호가 있는 행만 처리
        if ($el.find('td.list_num').length === 0) return;

        const titleLink = $el.find('td.sbj a').first();
        const title = titleLink.text().trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        const url = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${this.baseUrl}${relativeUrl}`;

        const author = $el.find('td.list_name span.lop').text().trim() || '익명';
        const viewCount = parseInt($el.find('td.list_click').text().trim().replace(/,/g, '')) || 0;
        const likeCount = parseInt($el.find('td.list_vote').text().trim()) || 0;
        // 댓글 수는 제목 옆 [N] 형태
        const titleHtml = $el.find('td.sbj').text();
        const commentMatch = titleHtml.match(/\[(\d+)\]/);
        const commentCount = commentMatch ? parseInt(commentMatch[1]) : 0;
        const timeText = $el.find('td.list_date span').attr('title') || $el.find('td.list_date').text().trim();
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

    // YYYY/MM/DD
    if (timeText.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      const [year, month, day] = timeText.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    // "YYYY년 MM월 DD일 HH시 MM분 SS초" format from title attr
    const match = timeText.match(/(\d{4})년\s+(\d{2})월\s+(\d{2})일/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }

    return now;
  }
}
