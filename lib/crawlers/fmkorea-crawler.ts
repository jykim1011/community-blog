import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class FmkoreaCrawler extends BaseCrawler {
  siteName = 'fmkorea';
  private readonly baseUrl = 'https://www.fmkorea.com';
  private readonly boardUrl = 'https://www.fmkorea.com/index.php?mid=best';

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

      $('li.li_best2_pop0, li.li_best2_pop1, li.li_best2_pop2, li.li_best2_pop3, li[class^="li "]').each((_, element) => {
        try {
          const $el = $(element);

          const titleLink = $el.find('h3.title a').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('.author a').text().trim() || '익명';
          const viewCount = parseInt($el.find('.count').text().trim().replace(/,/g, '')) || 0;
          const commentCount = parseInt($el.find('.comment_count').text().trim()) || 0;
          const likeCount = parseInt($el.find('.voted_count').text().trim()) || 0;
          const timeText = $el.find('.regdate').text().trim();
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

      // 테이블 형태 게시판도 시도
      if (posts.length === 0) {
        $('table.bd_lst tbody tr').each((_, element) => {
          try {
            const $el = $(element);
            if ($el.hasClass('notice')) return;

            const titleLink = $el.find('td.title a').first();
            const title = titleLink.text().trim();
            const relativeUrl = titleLink.attr('href');

            if (!title || !relativeUrl) return;

            const url = relativeUrl.startsWith('http')
              ? relativeUrl
              : `${this.baseUrl}${relativeUrl}`;

            const author = $el.find('td.author a').text().trim() || '익명';
            const viewCount = parseInt($el.find('td.m_no').text().trim().replace(/,/g, '')) || 0;
            const commentCount = parseInt($el.find('.replyNum').text().trim()) || 0;
            const likeCount = parseInt($el.find('td.m_no_voted').text().trim()) || 0;
            const timeText = $el.find('td.time').text().trim();
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
      }

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

    if (timeText.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(2000 + year, month - 1, day);
    }

    if (timeText.includes('분 전')) {
      const minutes = parseInt(timeText);
      return new Date(now.getTime() - minutes * 60 * 1000);
    }

    if (timeText.includes('시간 전')) {
      const hours = parseInt(timeText);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }

    return now;
  }
}
