import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class NatepannCrawler extends BaseCrawler {
  siteName = 'natepann';
  private readonly baseUrl = 'https://pann.nate.com';
  private readonly boardUrl = 'https://pann.nate.com/talk/ranking';

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

      $('ul.post_wrap li, div.rankinglist li').each((_, element) => {
        try {
          const $el = $(element);

          const titleLink = $el.find('a').first();
          const title = titleLink.find('.tit, .title').text().trim() || titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const viewText = $el.find('.count, .hit').text().trim().replace(/,/g, '');
          const viewCount = parseInt(viewText) || 0;
          const commentText = $el.find('.comment, .reply').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]()]/g, '')) || 0;
          const likeText = $el.find('.like, .good').text().trim();
          const likeCount = parseInt(likeText.replace(/,/g, '')) || 0;
          const timeText = $el.find('.date, .time').text().trim();
          const createdAt = this.parseDate(timeText);

          posts.push({
            id: '',
            title,
            author: '익명',
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

    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    return now;
  }
}
