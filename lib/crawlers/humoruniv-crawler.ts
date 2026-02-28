import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class HumorunivCrawler extends BaseCrawler {
  siteName = 'humoruniv';
  private readonly baseUrl = 'https://web.humoruniv.com';
  private readonly boardUrl = 'http://web.humoruniv.com/board/humor/list.html?table=pds&st=day';

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
    return `${this.boardUrl}&pg=${page}`;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: this.baseUrl,
      },
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const html = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    const $ = cheerio.load(html);
    const posts: Post[] = [];

    $('dd').each((_, element) => {
      try {
        const $el = $(element);

        const titleLink = $el.find('span.subj a.li').first();
        const title = titleLink.text().trim().replace(/^\s*/, '');
        const relativeUrl = titleLink.attr('href');

        if (!title || !relativeUrl) return;

        // 이미지 텍스트 제거
        const cleanTitle = title.replace(/\s+/g, ' ').trim();
        if (!cleanTitle) return;

        const url = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${this.baseUrl}${relativeUrl}`;

        const author = $el.find('.hu_nick_txt').first().text().trim() || '익명';
        const okText = $el.find('span.ok').text().trim();
        const likeCount = parseInt(okText) || 0;

        posts.push({
          id: '',
          title: cleanTitle,
          author,
          site: this.siteName,
          url,
          viewCount: 0,
          commentCount: 0,
          likeCount,
          createdAt: new Date(),
          fetchedAt: new Date(),
        });
      } catch (error) {
        this.handleError(error, 'parsing post');
      }
    });

    return posts;
  }
}
