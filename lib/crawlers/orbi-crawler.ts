import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class OrbiCrawler extends BaseCrawler {
  siteName = 'orbi';
  private readonly baseUrl = 'https://orbi.kr';
  private readonly boardUrl = 'https://orbi.kr/board/united';

  async crawl(): Promise<Post[]> {
    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      const response = await axios.get(this.boardUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const posts: Post[] = [];

      $('li.post-item, .board-list-item').each((_, element) => {
        try {
          const $el = $(element);

          if ($el.hasClass('notice')) return;

          const titleLink = $el.find('a.title, a.post-title').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('.author, .nickname').text().trim() || '익명';
          const viewCount = parseInt($el.find('.view-count, .hit').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('.like-count, .recommend').text().trim()) || 0;
          const commentText = $el.find('.comment-count, .reply-count').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]()]/g, '')) || 0;
          const timeText = $el.find('.date, .time').text().trim();
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

    if (timeText.includes('분 전')) {
      const minutes = parseInt(timeText);
      return new Date(now.getTime() - minutes * 60 * 1000);
    }

    if (timeText.includes('시간 전')) {
      const hours = parseInt(timeText);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }

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
