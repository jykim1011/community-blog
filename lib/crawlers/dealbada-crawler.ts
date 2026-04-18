import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';
import { normalizeUrl, toAbsoluteUrl } from '../utils/url-normalizer';

export class DealbadaCrawler extends BaseCrawler {
  siteName = 'dealbada';
  private readonly baseUrl = 'http://www.dealbada.com';
  private readonly boardUrl = 'http://www.dealbada.com/bbs/board.php?bo_table=deal_domestic';

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
    return `${this.boardUrl}&page=${page}`;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    // 먼저 UTF-8로 시도
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: this.baseUrl,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000,
      });

      const html = typeof response.data === 'string' ? response.data : response.data.toString('utf-8');
      const $ = cheerio.load(html);
      return this.parsePosts($);
    } catch (error) {
      // UTF-8 실패 시 EUC-KR/CP949로 재시도
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

      const buffer = Buffer.from(response.data);
      const html = iconv.decode(buffer, 'EUC-KR');
      const $ = cheerio.load(html);
      return this.parsePosts($);
    }
  }

  private parsePosts($: cheerio.CheerioAPI): Post[] {
    const posts: Post[] = [];

    // 딜바다 구조: table.hoverTable
    $('table.hoverTable tbody tr').each((_, element) => {
      try {
        const $el = $(element);

        // 공지/광고 스킵
        const firstTd = $el.find('td').first().text().trim();
        if (firstTd === '공지' || firstTd === '필독') return;

        const titleLink = $el.find('td.td_subject a').first();
        const title = titleLink
          .clone()
          .children()
          .remove()
          .end()
          .text()
          .trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        // URL 정규화
        const absoluteUrl = toAbsoluteUrl(relativeUrl, this.baseUrl);
        const normalizedUrl = normalizeUrl(absoluteUrl, this.siteName);

        // 작성자 (프로필 링크의 텍스트)
        const authorLink = $el.find('td.td_name a').first();
        const author = authorLink.text().trim() || '익명';

        // 조회수 (6번째 td)
        const tds = $el.find('td');
        const viewText = tds.eq(6).text().trim().replace(/,/g, '');
        const viewCount = parseInt(viewText) || 0;

        // 댓글/좋아요 (7번째 td, "댓글수 / 좋아요수" 형식)
        const metaText = tds.eq(7).text().trim();
        const metaMatch = metaText.match(/(\d+)\s*\/\s*(\d+)/);
        const commentCount = metaMatch ? parseInt(metaMatch[1]) : 0;
        const likeCount = metaMatch ? parseInt(metaMatch[2]) : 0;

        // 시간 (5번째 td)
        const timeText = tds.eq(5).text().trim();
        const createdAt = this.parseDate(timeText);

        // 썸네일
        const thumbnailElement = $el.find('img').first();
        const thumbnailSrc = thumbnailElement.attr('data-src') || thumbnailElement.attr('src');
        const thumbnail =
          thumbnailSrc && thumbnailSrc.startsWith('http')
            ? thumbnailSrc
            : thumbnailSrc
            ? `${this.baseUrl}${thumbnailSrc}`
            : undefined;

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

    // HH:MM:SS 형식
    if (timeText.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes, seconds] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, seconds, 0);
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
