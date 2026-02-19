import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class PpomppuCrawler extends BaseCrawler {
  siteName = 'ppomppu';
  private readonly baseUrl = 'https://www.ppomppu.co.kr';
  private readonly boardUrl = 'https://www.ppomppu.co.kr/zboard/zboard.php?id=freeboard';

  async crawl(): Promise<Post[]> {
    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      const response = await axios.get(this.boardUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: this.baseUrl,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const html = iconv.decode(Buffer.from(response.data), 'EUC-KR');
      const $ = cheerio.load(html);
      const posts: Post[] = [];

      $('tr.baseList').each((_, element) => {
        try {
          const $el = $(element);

          // 공지/광고 스킵
          if ($el.hasClass('baseNotice')) return;

          const titleLink = $el.find('a.baseList-title').first();
          const title = titleLink.text().trim();
          const relativeUrl = titleLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}/zboard/${relativeUrl}`;

          const author = $el.find('a.baseList-name .list_name').text().trim() || '익명';
          const viewCount = parseInt($el.find('.baseList-views').text().trim().replace(/,/g, '')) || 0;
          const likeCount = parseInt($el.find('.baseList-rec').text().trim()) || 0;
          const timeText = $el.find('time.baseList-time').text().trim();
          const createdAt = this.parseDate(timeText);

          posts.push({
            id: '',
            title,
            author,
            site: this.siteName,
            url,
            viewCount,
            commentCount: 0,
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

    // YY/MM/DD
    if (timeText.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const [year, month, day] = timeText.split('/').map(Number);
      return new Date(2000 + year, month - 1, day);
    }

    return now;
  }
}
