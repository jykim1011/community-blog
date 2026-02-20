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

      // 1단계: hit.php에서 게시글 목록 + bn_id 수집
      const rawPosts: { title: string; author: string; viewCount: number; likeCount: number; commentCount: number; createdAt: Date; bnId: string }[] = [];

      $('li.hit_item').each((_, element) => {
        try {
          const $el = $(element);
          if ($el.hasClass('ad_list')) return;

          const contentLink = $el.find('a.content_link').first();
          const title = $el.find('p.subject').text().trim();
          const relativeUrl = contentLink.attr('href');

          if (!title || !relativeUrl) return;

          // hit.php?bn_id= 형태에서 bn_id 추출
          const bnMatch = relativeUrl.match(/bn_id=(\d+)/);
          if (!bnMatch) return;

          const author = $el.find('span.nick').text().trim() || '익명';
          const hitText = $el.find('span.hit').text().trim();
          const viewCount = parseInt(hitText.replace(/[^0-9]/g, '')) || 0;
          const goodText = $el.find('span.good').text().trim();
          const likeCount = parseInt(goodText.replace(/[^0-9]/g, '')) || 0;
          const commentText = $el.find('span.comment_cnt').text().trim();
          const commentCount = parseInt(commentText.replace(/[()]/g, '')) || 0;
          const timeText = $el.find('span.datetime').text().trim();
          const createdAt = this.parseDate(timeText);

          rawPosts.push({
            title, author, viewCount, likeCount, commentCount, createdAt,
            bnId: bnMatch[1],
          });
        } catch (error) {
          this.handleError(error, 'parsing post');
        }
      });

      // 2단계: 각 bn_id의 실제 URL을 병렬로 추출 (최대 20개)
      const postsToResolve = rawPosts.slice(0, 20);
      const resolvedUrls = await Promise.allSettled(
        postsToResolve.map(p => this.resolveRealUrl(p.bnId))
      );

      const posts: Post[] = [];
      for (let i = 0; i < postsToResolve.length; i++) {
        const result = resolvedUrls[i];
        const realUrl = result.status === 'fulfilled' ? result.value : null;
        if (!realUrl) continue;

        const p = postsToResolve[i];
        posts.push({
          id: '',
          title: p.title,
          author: p.author,
          site: this.siteName,
          url: realUrl,
          viewCount: p.viewCount,
          commentCount: p.commentCount,
          likeCount: p.likeCount,
          createdAt: p.createdAt,
          fetchedAt: new Date(),
        });
      }

      console.log(`[${this.siteName}] Crawled ${posts.length} posts (resolved from ${rawPosts.length})`);
      return posts;
    } catch (error) {
      this.handleError(error, 'crawl');
      return [];
    }
  }

  /**
   * hit.php?bn_id= 페이지에서 JS 리다이렉트 URL을 추출
   * 페이지에 location.href = './board.php?bo_table=XXX&wr_id=YYY' 가 포함됨
   */
  private async resolveRealUrl(bnId: string): Promise<string | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/bbs/hit.php?bn_id=${bnId}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        responseType: 'arraybuffer',
        timeout: 5000,
      });
      const html = iconv.decode(Buffer.from(res.data), 'EUC-KR');

      const match = html.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (match) {
        const relUrl = match[1];
        if (relUrl.startsWith('http')) return relUrl;
        if (relUrl.startsWith('./')) return `${this.baseUrl}/bbs/${relUrl.slice(2)}`;
        if (relUrl.startsWith('/')) return `${this.baseUrl}${relUrl}`;
        return `${this.baseUrl}/bbs/${relUrl}`;
      }
      return null;
    } catch {
      return null;
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
      let date = new Date(now.getFullYear(), month - 1, day);
      if (date > now) {
        date = new Date(now.getFullYear() - 1, month - 1, day);
      }
      return date;
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
