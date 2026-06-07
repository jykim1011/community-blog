import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';
import { isValidPostThumbnail } from '../utils/thumbnail-validator';
import { normalizeUrl, toAbsoluteUrl } from '../utils/url-normalizer';

export class ExtmovieCrawler extends BaseCrawler {
  siteName = 'extmovie';
  protected readonly baseUrl = 'https://extmovie.com';
  private readonly boardUrl = 'https://extmovie.com/movietalk';

  async crawl(): Promise<Post[]> {
    const allPosts: Post[] = [];
    const PAGES_TO_CRAWL = 10;

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
    if (page === 1) return this.boardUrl;
    return `${this.boardUrl}?page=${page}`;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: this.baseUrl,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const posts: Post[] = [];

    // 익스트림무비 게시판 구조 (TABLE 기반)
    $('div.ink_list tbody tr').each((_, element) => {
      try {
        const $el = $(element);

        // 공지 스킵
        if ($el.hasClass('notice')) return;

        const titleLink = $el.find('td.list_title a.title_link').first();
        const title = titleLink.text().trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        // URL 정규화
        const absoluteUrl = toAbsoluteUrl(relativeUrl, this.baseUrl);
        const normalizedUrl = normalizeUrl(absoluteUrl, this.siteName);

        // 작성자
        const authorElement = $el.find('td.list_author a');
        const author = authorElement.text().trim().replace(/\[레벨:\d+\]/, '').trim() || '익명';

        // 조회수
        const viewText = $el.find('td.extra_col span').text().trim().replace(/,/g, '');
        const viewCount = parseInt(viewText) || 0;

        // 댓글
        const commentLink = $el.find('a.cmt_num');
        const commentText = commentLink.text().trim();
        const commentCount = parseInt(commentText) || 0;

        // 좋아요 (익스트림무비는 좋아요 정보 없음)
        const likeCount = 0;

        // 날짜
        const timeText = $el.find('td.date span.ink_date').text().trim();
        const createdAt = this.parseDate(timeText);

        // 썸네일
        const thumbnailElement = $el.find('img').first();
        const thumbnailSrc = thumbnailElement.attr('data-src') || thumbnailElement.attr('src');
        const rawThumb =
          thumbnailSrc && thumbnailSrc.startsWith('http')
            ? thumbnailSrc
            : thumbnailSrc
            ? `${this.baseUrl}${thumbnailSrc}`
            : undefined;
        const thumbnail = isValidPostThumbnail(rawThumb) ? rawThumb : undefined;

        posts.push({
          id: '',
          title,
          author,
          site: this.siteName,
          url: normalizedUrl,
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

    // "방금 전", "N분 전", "N시간 전"
    if (timeText.includes('방금')) {
      return now;
    }

    const minutesMatch = timeText.match(/(\d+)분\s*전/);
    if (minutesMatch) {
      const date = new Date(now);
      date.setMinutes(date.getMinutes() - parseInt(minutesMatch[1]));
      return date;
    }

    const hoursMatch = timeText.match(/(\d+)시간\s*전/);
    if (hoursMatch) {
      const date = new Date(now);
      date.setHours(date.getHours() - parseInt(hoursMatch[1]));
      return date;
    }

    // "N일 전"
    const daysMatch = timeText.match(/(\d+)일\s*전/);
    if (daysMatch) {
      const date = new Date(now);
      date.setDate(date.getDate() - parseInt(daysMatch[1]));
      return date;
    }

    // HH:MM 형식
    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      if (date > now) date.setDate(date.getDate() - 1);
      return date;
    }

    // MM-DD 형식
    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      const date = new Date(now.getFullYear(), month - 1, day);
      if (date > now) {
        date.setFullYear(now.getFullYear() - 1);
      }
      return date;
    }

    // YYYY-MM-DD 형식
    if (timeText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(timeText);
    }

    return now;
  }
}
