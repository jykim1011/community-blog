import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class HygallCrawler extends BaseCrawler {
  siteName = 'hygall';
  private readonly baseUrl = 'https://hygall.com';
  private readonly boardUrl = 'https://hygall.com/index.php?mid=hy';

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

      $('tr.docList').each((_, element) => {
        try {
          const $el = $(element);

          const titleLink = $el.find('td.title a.exJsHotTrackA').first();
          const title = titleLink.text().trim();
          const url = titleLink.attr('href');

          if (!title || !url) return;

          const author = $el.find('td.nick_name').text().trim() || '익명';
          const viewCount = parseInt($el.find('td.readed_count').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('td.voted_count').text().trim().replace(/[&nbsp;\s]/g, '')) || 0;
          const commentText = $el.find('span.replies').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]]/g, '')) || 0;
          const timeText = $el.find('td.regdate').text().trim();
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

    if (timeText.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // MM-DD
    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    if (timeText.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(2000 + year, month - 1, day);
    }

    return now;
  }
}
