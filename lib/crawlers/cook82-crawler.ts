import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class Cook82Crawler extends BaseCrawler {
  siteName = 'cook82';
  private readonly baseUrl = 'https://www.82cook.com';
  private readonly boardUrl = 'https://www.82cook.com/entiz/enti.php?bn=15';

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

      $('#bbs table tbody tr').each((_, element) => {
        try {
          const $el = $(element);

          // 공지 스킵
          if ($el.hasClass('noticeList')) return;

          const titleLink = $el.find('td.title a').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}/entiz/${relativeUrl}`;

          const author = $el.find('td.user_function').text().trim() || '익명';
          // 마지막 td.numbers가 조회수
          const numbersTds = $el.find('td.numbers');
          const viewCount = parseInt($(numbersTds.last()).text().trim().replace(/,/g, '')) || 0;
          // 댓글 수는 제목 옆 <em> 태그
          const commentText = $el.find('td.title em').text().trim();
          const commentCount = parseInt(commentText) || 0;
          const timeText = $el.find('td.regdate').attr('title') || $el.find('td.regdate').text().trim();
          const createdAt = this.parseDate(timeText);

          posts.push({
            id: '',
            title,
            author,
            site: this.siteName,
            url,
            viewCount,
            commentCount,
            likeCount: 0,
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

    // Full datetime: "2026-02-18 13:58:27"
    if (timeText.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return new Date(timeText);
    }

    // HH:MM:SS
    if (timeText.match(/^\s*\d{2}:\d{2}:\d{2}\s*$/)) {
      const [hours, minutes, seconds] = timeText.trim().split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, seconds, 0);
      return date;
    }

    if (timeText.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
