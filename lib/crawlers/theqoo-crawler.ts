import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class TheQooCrawler extends BaseCrawler {
  siteName = 'theqoo';
  private readonly baseUrl = 'https://theqoo.net';
  private readonly boardUrl = 'https://theqoo.net/hot';

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

      $('table.bd_lst tbody tr').each((_, element) => {
        try {
          const $el = $(element);

          // 공지사항 스킵
          if ($el.hasClass('notice')) return;

          // 제목과 URL
          const titleLink = $el.find('td.title > a').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          // 카테고리
          const category = $el.find('td.cate span').text().trim() || undefined;

          // 댓글수
          const replyText = $el.find('.replyNum').text().trim();
          const commentCount = parseInt(replyText) || 0;

          // 조회수
          const viewText = $el.find('td.m_no').text().trim().replace(/,/g, '');
          const viewCount = parseInt(viewText) || 0;

          // 작성 시간
          const timeText = $el.find('td.time').text().trim();
          const createdAt = this.parseDate(timeText);

          posts.push({
            id: '',
            title,
            author: '익명',
            site: this.siteName,
            url,
            viewCount,
            commentCount,
            likeCount: 0,
            createdAt,
            fetchedAt: new Date(),
            category,
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

    // "HH:MM" 형식 (오늘)
    if (timeText.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // "YY.MM.DD" 형식
    if (timeText.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(2000 + year, month - 1, day);
    }

    return now;
  }
}
