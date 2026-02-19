import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class EtolandCrawler extends BaseCrawler {
  siteName = 'etoland';
  private readonly baseUrl = 'https://www.etoland.co.kr';
  private readonly boardUrl = 'https://www.etoland.co.kr/bbs/hit.php';

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

      const html = iconv.decode(Buffer.from(response.data), 'EUC-KR');
      const $ = cheerio.load(html);
      const posts: Post[] = [];

      $('li.hit_item').each((_, element) => {
        try {
          const $el = $(element);

          // 광고 스킵
          if ($el.hasClass('ad_list')) return;

          const contentLink = $el.find('a.content_link').first();
          const title = $el.find('p.subject').text().trim();
          const relativeUrl = contentLink.attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          const author = $el.find('span.nick').text().trim() || '익명';
          const hitText = $el.find('span.hit').text().trim();
          const viewCount = parseInt(hitText.replace(/[^0-9]/g, '')) || 0;
          const goodText = $el.find('span.good').text().trim();
          const likeCount = parseInt(goodText.replace(/[^0-9]/g, '')) || 0;
          const commentText = $el.find('span.comment_cnt').text().trim();
          const commentCount = parseInt(commentText.replace(/[()]/g, '')) || 0;
          const timeText = $el.find('span.datetime').text().trim();
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

    if (timeText.includes('방금') || timeText.includes('초 전')) {
      return now;
    }

    if (timeText.includes('분 전')) {
      const minutes = parseInt(timeText);
      return new Date(now.getTime() - minutes * 60 * 1000);
    }

    if (timeText.includes('시간 전')) {
      const hours = parseInt(timeText);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }

    // MM-DD
    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    if (timeText.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeText.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    return now;
  }
}
