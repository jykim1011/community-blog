import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class InvenCrawler extends BaseCrawler {
  siteName = 'inven';
  private readonly baseUrl = 'https://hot.inven.co.kr';
  private readonly boardUrl = 'https://hot.inven.co.kr/';

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

      $('.list-common').each((_, element) => {
        try {
          const $el = $(element);

          // 제목 및 URL
          const titleLink = $el.find('.title a').first();
          const url = titleLink.attr('href');

          if (!url) return;

          // 카테고리 (게임명)
          const category = $el.find('.cate').text().trim();

          // 제목 (name div에서 num, cate 제외한 텍스트)
          const nameDiv = $el.find('.name');
          const title = nameDiv.clone().children().remove().end().text().trim();

          if (!title) return;

          // 댓글수
          const commentText = $el.find('.comment').text().trim();
          const commentCount = parseInt(commentText.replace(/[\[\]]/g, '')) || 0;

          // 작성자 (레벨 정보 다음 텍스트)
          const userDiv = $el.find('.user');
          const author = userDiv.text().trim() || '익명';

          // 날짜
          const timeText = $el.find('.date').text().trim();
          const createdAt = this.parseDate(timeText);

          // 조회수
          const viewText = $el.find('.hits').text().trim();
          const viewCount = parseInt(viewText.replace(/,/g, '')) || 0;

          // 추천수
          const likeText = $el.find('.reco').text().trim();
          const likeCount = parseInt(likeText.replace(/,/g, '')) || 0;

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

    // HH:MM format (오늘)
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

    // YYYY.MM.DD format
    if (timeText.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      const [year, month, day] = timeText.split('.').map(Number);
      return new Date(year, month - 1, day);
    }

    return now;
  }
}
