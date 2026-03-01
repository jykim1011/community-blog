import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class RuliwebCrawler extends BaseCrawler {
  siteName = 'ruliweb';
  private readonly baseUrl = 'https://bbs.ruliweb.com';
  private readonly boardUrl = 'https://bbs.ruliweb.com/community/board/300143';

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
    return `${this.boardUrl}?page=${page}`;
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

    $('tr.table_body.blocktarget').each((_, element) => {
      try {
        const $el = $(element);

        // 공지사항 스킵
        if ($el.hasClass('notice')) return;

        // 제목과 URL
        const titleLink = $el.find('.subject_link');
        const title = titleLink.text().trim();
        const url = titleLink.attr('href');

        if (!title || !url) return;

        // 작성자
        const author = $el.find('td.writer a').text().trim() || '익명';

        // 카테고리
        const category = $el.find('td.divsn a').text().trim() || undefined;

        // 추천수
        const recomdText = $el.find('td.recomd').text().trim();
        const likeCount = parseInt(recomdText) || 0;

        // 조회수
        const hitText = $el.find('td.hit').text().trim().replace(/,/g, '');
        const viewCount = parseInt(hitText) || 0;

        // 작성 시간
        const timeText = $el.find('td.time').text().trim();
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
          category,
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

    // "HH:MM" 형식 (오늘)
    if (timeText.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // "YYYY.MM.DD" 형식
    if (timeText.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
