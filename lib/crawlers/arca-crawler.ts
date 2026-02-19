import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class ArcaCrawler extends BaseCrawler {
  siteName = 'arca';
  private readonly baseUrl = 'https://arca.live';
  private readonly boardUrl = 'https://arca.live/b/live';

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

      $('a.vrow').each((_, element) => {
        try {
          const $el = $(element);

          if ($el.hasClass('notice')) return;

          const title = $el.find('.title').text().trim().replace(/\s+/g, ' ');
          const relativeUrl = $el.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('.user-info').text().trim() || '익명';
          const viewCount = parseInt($el.find('.col-view').text().trim()) || 0;
          const likeCount = parseInt($el.find('.col-rate').text().trim()) || 0;
          const commentText = $el.find('.comment-count').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]]/g, '')) || 0;
          const timeText = $el.find('.col-time time').attr('datetime') || $el.find('.col-time').text().trim();
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

    // ISO datetime
    if (timeText.includes('T')) {
      const date = new Date(timeText);
      if (!isNaN(date.getTime())) return date;
    }

    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    if (timeText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(timeText);
    }

    return now;
  }
}
