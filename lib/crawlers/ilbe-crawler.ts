import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class IlbeCrawler extends BaseCrawler {
  siteName = 'ilbe';
  private readonly baseUrl = 'https://www.ilbe.com';
  private readonly boardUrl = 'https://www.ilbe.com/list/ilbe';

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

      $('ul.board-body > li').each((_, element) => {
        try {
          const $el = $(element);

          // 공지, 광고, 헤더 스킵
          if ($el.hasClass('notice-line') || $el.hasClass('ad-line') || $el.hasClass('title-line')) return;

          const titleLink = $el.find('a.subject').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('span.nick a').text().trim() || $el.find('span.global-nick.nick').text().trim() || '익명';
          const viewCount = parseInt($el.find('span.view').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('span.recomm').text().trim().replace(/,/g, '')) || 0;
          const commentText = $el.find('.ico-set .comment a').text().trim();
          const commentCount = parseInt(commentText) || 0;
          const timeText = $el.find('span.date').text().trim();
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

    // HH:MM:SS format
    if (timeText.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes, seconds] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, seconds, 0);
      return date;
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
