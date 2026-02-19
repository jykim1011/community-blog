import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class TodayhumorCrawler extends BaseCrawler {
  siteName = 'todayhumor';
  private readonly baseUrl = 'https://www.todayhumor.co.kr';
  private readonly boardUrl = 'https://www.todayhumor.co.kr/board/list.php?table=bestofbest';

  async crawl(): Promise<Post[]> {
    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      const response = await axios.get(this.boardUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: this.baseUrl,
        },
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const html = iconv.decode(Buffer.from(response.data), 'UTF-8');
      const $ = cheerio.load(html);
      const posts: Post[] = [];

      $('table.table_list tbody tr').each((_, element) => {
        try {
          const $el = $(element);

          if ($el.hasClass('notice')) return;

          const titleLink = $el.find('td.subject a').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('td.name').text().trim() || '익명';
          const viewCount = parseInt($el.find('td.hits').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('td.oknok').text().trim()) || 0;
          const commentText = $el.find('.list_memo_count_span').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]()]/g, '')) || 0;
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

    if (timeText.match(/^\d{2}\/\d{2}$/)) {
      const [month, day] = timeText.split('/').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    if (timeText.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      const [year, month, day] = timeText.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
