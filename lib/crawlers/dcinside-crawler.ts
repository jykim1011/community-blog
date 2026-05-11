import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';
import { normalizeUrl, toAbsoluteUrl } from '../utils/url-normalizer';

export class DcinsideCrawler extends BaseCrawler {
  siteName = 'dcinside';
  protected readonly baseUrl = 'https://gall.dcinside.com';
  private readonly mainUrl = 'https://www.dcinside.com';
  private readonly boardUrl = 'https://gall.dcinside.com/board/lists/?id=dcbest';
  private cookies: string = '';

  async crawl(): Promise<Post[]> {
    const allPosts: Post[] = [];
    const PAGES_TO_CRAWL = 10;

    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      // 1단계: 메인 페이지 방문하여 쿠키 획득
      await this.acquireCookies();

      // Crawl-Delay 확인
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

          // 페이지 간 랜덤 딜레이 (3-5초)
          if (page < PAGES_TO_CRAWL) {
            const delayMs = crawlDelay ? crawlDelay * 1000 : this.randomDelay(3000, 5000);
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

  // 랜덤 딜레이 생성 (밀리초)
  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // 메인 페이지 방문하여 쿠키 획득
  private async acquireCookies(): Promise<void> {
    try {
      console.log(`[${this.siteName}] Acquiring cookies from main page...`);
      const response = await axios.get(this.mainUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const cookies = response.headers['set-cookie'];
      if (cookies && cookies.length > 0) {
        this.cookies = cookies.join('; ');
        console.log(`[${this.siteName}] Cookies acquired: ${cookies.length} cookies`);
      } else {
        console.warn(`[${this.siteName}] No cookies received`);
      }

      // 쿠키 획득 후 2-3초 대기
      await this.delay(this.randomDelay(2000, 3000));
    } catch (error) {
      console.warn(`[${this.siteName}] Failed to acquire cookies:`, (error as Error).message);
      // 쿠키 없이도 시도
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
        'Referer': this.mainUrl,
        'Cookie': this.cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const posts: Post[] = [];

    $('tr.ub-content.us-post').each((_, element) => {
      try {
        const $el = $(element);

        // 제목 링크 선택: 이미지 아이콘 링크를 제외한 실제 제목 링크
        const titleElement = $el.find('td.gall_tit a').filter((_, el) => {
          const text = $(el).text().trim();
          return text.length > 0; // 텍스트가 있는 링크만
        }).first();

        const title = titleElement.text().trim();
        const href = titleElement.attr('href');

        if (!title || !href) return;

        // 절대 URL 변환 후 정규화 (page, _dcbest 등 파라미터 제거)
        const absoluteUrl = toAbsoluteUrl(href, this.baseUrl);
        const url = normalizeUrl(absoluteUrl, this.siteName);

        const author = $el.find('td.gall_writer .nickname').text().trim() || '익명';
        const viewCount = parseInt($el.find('td.gall_count').text().trim()) || 0;
        const likeCount = parseInt($el.find('td.gall_recommend').text().trim()) || 0;
        const replyText = $el.find('td.gall_tit .reply_num').text().trim();
        const commentCount = parseInt(replyText.replace(/[\[\]]/g, '')) || 0;
        const timeText = $el.find('td.gall_date').attr('title') || $el.find('td.gall_date').text().trim();
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
          thumbnail,
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
      if (date > now) date.setDate(date.getDate() - 1);
      return date;
    }

    // "MM.DD" 형식
    if (timeText.match(/^\d{2}\.\d{2}$/)) {
      const [month, day] = timeText.split('.').map(Number);
      const date = new Date(now.getFullYear(), month - 1, day);
      if (date > now) date.setFullYear(now.getFullYear() - 1);
      return date;
    }

    return now;
  }
}
