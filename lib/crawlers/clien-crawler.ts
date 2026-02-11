import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class ClienCrawler extends BaseCrawler {
  siteName = 'clien';
  private readonly baseUrl = 'https://www.clien.net';
  private readonly boardUrl = 'https://www.clien.net/service/board/park';

  async crawl(): Promise<Post[]> {
    try {
      console.log(`[${this.siteName}] Starting crawl...`);

      // 클리앙 베스트 게시판 페이지 가져오기
      const response = await axios.get(this.boardUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const posts: Post[] = [];

      // 게시글 목록 파싱
      $('.list_item').each((_, element) => {
        try {
          const $el = $(element);

          // 제목과 URL
          const titleElement = $el.find('.subject_fixed');
          const title = titleElement.text().trim();
          const relativeUrl = $el.find('.list_subject').attr('href');

          if (!title || !relativeUrl) return;

          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `${this.baseUrl}${relativeUrl}`;

          // 작성자
          const author = $el.find('.list_author .nickname').text().trim() || '익명';

          // 조회수, 댓글수, 좋아요수
          const viewCount = parseInt($el.find('.list_hit').text().trim() || '0');
          const commentCount = parseInt($el.find('.list_reply').text().trim() || '0');
          const likeCount = parseInt($el.find('.list_symph').text().trim() || '0');

          // 작성 시간
          const timeText = $el.find('.list_time').text().trim();
          const createdAt = this.parseDate(timeText);

          posts.push({
            id: '', // 데이터베이스에서 생성됨
            title,
            author,
            site: this.siteName,
            url,
            viewCount: isNaN(viewCount) ? 0 : viewCount,
            commentCount: isNaN(commentCount) ? 0 : commentCount,
            likeCount: isNaN(likeCount) ? 0 : likeCount,
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

  // 클리앙의 시간 포맷을 Date 객체로 변환
  private parseDate(timeText: string): Date {
    const now = new Date();

    // "방금 전", "1분 전" 등의 형식
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

    // "MM-DD" 형식
    if (timeText.match(/^\d{2}-\d{2}$/)) {
      const [month, day] = timeText.split('-').map(Number);
      return new Date(now.getFullYear(), month - 1, day);
    }

    // "YYYY-MM-DD" 형식
    if (timeText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(timeText);
    }

    // 파싱 실패 시 현재 시간 반환
    return now;
  }
}
