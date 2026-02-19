import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class SlrclubCrawler extends BaseCrawler {
  siteName = 'slrclub';
  private readonly baseUrl = 'https://www.slrclub.com';
  private readonly boardUrl = 'https://www.slrclub.com/bbs/zboard.php?id=free';

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

      $('tbody tr').each((_, element) => {
        try {
          const $el = $(element);

          // 공지 스킵
          if ($el.find('td.list_notice').length > 0) return;
          // 번호가 있는 행만 처리
          if ($el.find('td.list_num').length === 0) return;

          const titleLink = $el.find('td.sbj a').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('td.list_name span.lop').text().trim() || '익명';
          const viewCount = parseInt($el.find('td.list_click').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('td.list_vote').text().trim()) || 0;
          // 댓글 수는 제목 옆 [N] 형태
          const titleHtml = $el.find('td.sbj').text();
          const commentMatch = titleHtml.match(/\[(\d+)\]/);
          const commentCount = commentMatch ? parseInt(commentMatch[1]) : 0;
          const timeText = $el.find('td.list_date span').attr('title') || $el.find('td.list_date').text().trim();
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

    // HH:MM:SS
    if (timeText.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes, seconds] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, seconds, 0);
      return date;
    }

    // YYYY/MM/DD
    if (timeText.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      const [year, month, day] = timeText.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    // "YYYY년 MM월 DD일 HH시 MM분 SS초" format from title attr
    const match = timeText.match(/(\d{4})년\s+(\d{2})월\s+(\d{2})일/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }

    return now;
  }
}
