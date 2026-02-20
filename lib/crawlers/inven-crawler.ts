import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class InvenCrawler extends BaseCrawler {
  siteName = 'inven';
  private readonly baseUrl = 'https://www.inven.co.kr';
  private readonly boardUrl = 'https://www.inven.co.kr/board/it/2652';

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

      $('.board-list table tbody tr').each((_, element) => {
        try {
          const $el = $(element);

          // 공지 스킵
          if ($el.hasClass('notice') || $el.hasClass('lgtm')) return;

          const titleLink = $el.find('td.tit a.subject-link').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('td.user .layerNickName').text().trim() || '익명';
          const viewCount = parseInt($el.find('td.view').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('td.reco').text().trim()) || 0;
          const commentText = $el.find('.con-comment').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]&ensp;]/g, '')) || 0;
          const timeText = $el.find('td.date').text().trim();
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

    // MM-DD format
    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      let date = new Date(now.getFullYear(), month - 1, day);

      // 미래 날짜면 작년으로 간주
      if (date > now) {
        date = new Date(now.getFullYear() - 1, month - 1, day);
      }

      return date;
    }

    if (timeText.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
