import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class DcinsideCrawler extends BaseCrawler {
  siteName = 'dcinside';
  private readonly baseUrl = 'https://gall.dcinside.com';
  private readonly boardUrl = 'https://gall.dcinside.com/board/lists/?id=dcbest';

  async crawl(): Promise<Post[]> {
    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      const response = await axios.get(this.boardUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: this.baseUrl,
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const posts: Post[] = [];

      $('tr.ub-content.us-post').each((_, element) => {
        try {
          const $el = $(element);

          const titleLink = $el.find('td.gall_tit a').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('td.gall_writer .nickname').text().trim() || '익명';
          const viewCount = parseInt($el.find('td.gall_count').text().trim()) || 0;
          const likeCount = parseInt($el.find('td.gall_recommend').text().trim()) || 0;
          const replyText = $el.find('td.gall_tit .reply_num').text().trim();
          const commentCount = parseInt(replyText.replace(/[\[\]]/g, '')) || 0;
          const timeText = $el.find('td.gall_date').attr('title') || $el.find('td.gall_date').text().trim();
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

    // "YYYY-MM-DD HH:MM:SS" 형식
    if (timeText.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return new Date(timeText);
    }

    // "HH:MM" 형식
    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // "MM.DD" 형식
    if (timeText.match(/^\d{2}\.\d{2}$/)) {
      const [month, day] = timeText.split('.').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    return now;
  }
}
