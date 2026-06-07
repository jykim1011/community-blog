import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';
import { normalizeUrl, toAbsoluteUrl } from '../utils/url-normalizer';

export class DvdprimeCrawler extends BaseCrawler {
  siteName = 'dvdprime';
  protected readonly baseUrl = 'https://dvdprime.com';
  private readonly boardUrl = 'https://dvdprime.com/g2/bbs/board.php?bo_table=comm';

  async crawl(): Promise<Post[]> {
    // 메인 URL부터 429 반환 — 완전 봇 차단 상태
    console.log(`[${this.siteName}] Disabled: 429 bot blocking`);
    return [];

    const allPosts: Post[] = [];
    const PAGES_TO_CRAWL = 10;
    const MAX_RATE_LIMIT_RETRIES = 2;

    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      // Acquire session cookies first to reduce bot detection
      let sessionCookies = '';
      try {
        const mainRes = await axios.get(this.baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
          timeout: 10000,
        });
        const setCookie = mainRes.headers['set-cookie'];
        if (setCookie) {
          sessionCookies = (setCookie as string[]).map((c: string) => c.split(';')[0]).join('; ');
        }
      } catch {
        // continue without cookies
      }

      for (let page = 1; page <= PAGES_TO_CRAWL; page++) {
        let rateLimitRetries = 0;
        let success = false;

        while (!success && rateLimitRetries <= MAX_RATE_LIMIT_RETRIES) {
          try {
            const pageUrl = this.getPageUrl(page);
            const posts = await this.crawlPage(pageUrl, sessionCookies);

            if (posts.length === 0) {
              console.log(`[${this.siteName}] No more posts at page ${page}, stopping`);
              return allPosts;
            }

            allPosts.push(...posts);
            if (page < PAGES_TO_CRAWL) await this.delay(2000);
            success = true;
          } catch (error) {
            if ((error as any).response?.status === 429) {
              rateLimitRetries++;
              if (rateLimitRetries > MAX_RATE_LIMIT_RETRIES) {
                console.warn(`[${this.siteName}] Rate limited repeatedly, stopping`);
                return allPosts;
              }
              console.warn(`[${this.siteName}] Rate limited, retry ${rateLimitRetries}/${MAX_RATE_LIMIT_RETRIES}`);
              await this.delay(5000 * rateLimitRetries);
            } else if ((error as any).response?.status === 404) {
              console.log(`[${this.siteName}] Page ${page} not found, stopping`);
              return allPosts;
            } else {
              console.error(`[${this.siteName}] Error at page ${page}:`, (error as Error).message);
              return allPosts;
            }
          }
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

  private async crawlPage(url: string, cookies = ''): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': this.baseUrl,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...(cookies ? { 'Cookie': cookies } : {}),
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const posts: Post[] = [];

    // DVDPrime 구조: div.list_table_row
    $('div.list_table_row').not('.list_table_row_notice').each((_, element) => {
      try {
        const $el = $(element);

        // 제목 링크 (.list_table_col_subject 안의 두 번째 a 태그, 첫 번째는 카테고리)
        const titleLink = $el.find('.list_table_col_subject a').eq(1);
        // PC/모바일 span 중 PC용 제목 사용
        const titlePc = titleLink.find('.list_subject_span_pc').text().trim();
        const titleMobile = titleLink.find('.list_subject_span_mobile').text().trim();
        const title = titlePc || titleMobile || titleLink.text().trim();
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        // URL 정규화
        const absoluteUrl = toAbsoluteUrl(relativeUrl, this.baseUrl);
        const normalizedUrl = normalizeUrl(absoluteUrl, this.siteName);

        const author = $el.find('.list_table_col_name').text().trim() || '익명';

        const viewText = $el.find('.list_table_col_hit').text().trim().replace(/,/g, '');
        const viewCount = parseInt(viewText) || 0;

        const commentMatch = titleLink.find('.comment_cnt').text().match(/\d+/);
        const commentCount = commentMatch ? parseInt(commentMatch[0]) : 0;

        const likeText = $el.find('.list_table_col_recommend').text().trim();
        const likeCount = parseInt(likeText) || 0;

        const timeText = $el.find('.list_table_col_date').text().trim();
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

    // HH:MM 형식
    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
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
