import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';
import { normalizeUrl, toAbsoluteUrl } from '../utils/url-normalizer';

export class CoolenjoyCrawler extends BaseCrawler {
  siteName = 'coolenjoy';
  protected readonly baseUrl = 'https://coolenjoy.net';
  private readonly boardUrl = 'https://coolenjoy.net/bbs/freeboard2';

  async crawl(): Promise<Post[]> {
    const allPosts: Post[] = [];
    const PAGES_TO_CRAWL = 10;

    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      // robots.txt의 Crawl-Delay 확인
      const crawlDelay = await this.getCrawlDelay();
      if (crawlDelay) {
        console.log(`[${this.siteName}] Respecting Crawl-Delay: ${crawlDelay}s`);
      }

      for (let page = 1; page <= PAGES_TO_CRAWL; page++) {
        try {
          const pageUrl = this.getPageUrl(page);

          // robots.txt 확인
          const canCrawl = await this.checkRobotsTxt(pageUrl);
          if (!canCrawl) {
            console.warn(`[${this.siteName}] Skipping page ${page} due to robots.txt`);
            continue;
          }

          const posts = await this.crawlPage(pageUrl);

          if (posts.length === 0) {
            console.log(`[${this.siteName}] No more posts at page ${page}, stopping`);
            break;
          }

          allPosts.push(...posts);

          // 페이지 간 딜레이 (robots.txt Crawl-Delay 또는 기본 1초)
          if (page < PAGES_TO_CRAWL) {
            const delayMs = crawlDelay ? crawlDelay * 1000 : 1000;
            await this.delay(delayMs);
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

    // 쿨엔조이 게시판 구조 (LI 기반)
    $('li.d-md-table-row').each((_, element) => {
      try {
        const $el = $(element);

        // 공지 스킵
        if ($el.hasClass('notice')) return;

        const titleLink = $el.find('a.na-subject').first();
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

        // 작성자
        const author = $el.find('a.sv_member').text().trim() || '익명';

        // 조회수 (쿨엔조이 목록 페이지에는 조회수 표시 안 됨)
        const viewCount = 0;

        // 댓글수
        const commentMatch = $el.find('span.count-plus a').text().match(/\d+/);
        const commentCount = commentMatch ? parseInt(commentMatch[0]) : 0;

        // 좋아요 (쿨엔조이 목록 페이지에는 좋아요 표시 안 됨)
        const likeCount = 0;

        // 날짜 (여러 위치에 있을 수 있음)
        const timeText = $el.find('.d-md-table-cell').last().text().trim() ||
                        $el.find('.text-muted').last().text().trim();
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
