import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class InstizCrawler extends BaseCrawler {
  siteName = 'instiz';
  private readonly baseUrl = 'https://www.instiz.net';
  private readonly boardUrl = 'https://www.instiz.net/pt';

  async crawl(): Promise<Post[]> {
    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      const response = await axios.get(this.boardUrl, {
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

      // 인스티즈 인기글 목록
      $('#mainboard tr, .listbody').each((_, element) => {
        try {
          const $el = $(element);

          const titleLink = $el.find('a.listsubject, td.listsubject a').first();
          if (titleLink.length === 0) return;

          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('.listwriter').text().trim() || '익명';
          const viewCount = parseInt($el.find('.listview').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('.listlike').text().trim()) || 0;
          const commentText = $el.find('.cmt, .listcmt').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]()]/g, '')) || 0;
          const timeText = $el.find('.listdate, .listtime').text().trim();
          const createdAt = this.parseDate(timeText);

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
          });
        } catch (error) {
          this.handleError(error, 'parsing post');
        }
      });

      console.log(`[${this.siteName}] Crawled ${posts.length} posts`);
      return posts;
    } catch (error) {
      this.handleError(error, 'crawl');
      return [];
    }
  }

  private parseDate(timeText: string): Date {
    const now = new Date();

    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    if (timeText.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
