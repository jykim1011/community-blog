import axios from 'axios';
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class EtolandCrawler extends BaseCrawler {
  siteName = 'etoland';
  protected readonly baseUrl = 'https://www.etoland.co.kr';
  private readonly cdnBase = 'https://btcdn.etoland.co.kr';
  private readonly listUrl = 'https://www.etoland.co.kr/hit/list';
  private readonly PAGES_TO_CRAWL = 10;

  async crawl(): Promise<Post[]> {
    const allPosts: Post[] = [];
    console.log(`[${this.siteName}] Starting crawl...`);

    for (let page = 1; page <= this.PAGES_TO_CRAWL; page++) {
      try {
        const url = page === 1 ? this.listUrl : `${this.listUrl}?page=${page}`;
        const posts = await this.crawlPage(url);

        if (posts.length === 0) {
          console.log(`[${this.siteName}] No more posts at page ${page}, stopping`);
          break;
        }

        allPosts.push(...posts);

        if (page < this.PAGES_TO_CRAWL) {
          await this.delay(1000);
        }
      } catch (error) {
        console.error(`[${this.siteName}] Error at page ${page}:`, (error as Error).message);
        break;
      }
    }

    console.log(`[${this.siteName}] Crawled ${allPosts.length} posts`);
    return allPosts;
  }

  private async crawlPage(url: string): Promise<Post[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Referer': this.baseUrl,
      },
      timeout: 15000,
    });

    const articles = this.extractArticlesFromRsc(response.data as string);
    return articles.map((a) => this.mapArticleToPost(a)).filter((p): p is Post => p !== null);
  }

  private extractArticlesFromRsc(html: string): any[] {
    // RSC data is embedded as: self.__next_f.push([1,"<JSON-encoded RSC tree>"])
    // Strategy: locate the push call containing "articleList", extract the full
    // quoted string by character-walking (handles \" and \\ escapes), then
    // JSON.parse to unescape, then extract the articleList array.
    const marker = '\\"articleList\\":[';
    const markerIdx = html.indexOf(marker);
    if (markerIdx === -1) return [];

    // Find the enclosing push([1," call by searching backwards
    const pushPrefix = 'self.__next_f.push([1,"';
    const pushStart = html.lastIndexOf(pushPrefix, markerIdx);
    if (pushStart === -1) return [];

    // Walk forward from the opening quote, skipping \" and \\ escape sequences,
    // until we find the unescaped closing "
    let i = pushStart + pushPrefix.length; // first char inside the quoted string
    while (i < html.length) {
      const ch = html[i];
      if (ch === '\\') {
        i += 2; // skip escape sequence (\" or \\)
      } else if (ch === '"') {
        break; // found the closing quote
      } else {
        i++;
      }
    }

    // Extract the full JSON string literal (from opening " to closing ")
    const openingQuoteIdx = pushStart + pushPrefix.length - 1;
    const jsonStr = html.slice(openingQuoteIdx, i + 1);

    try {
      const content: string = JSON.parse(jsonStr);
      return this.extractArticleList(content);
    } catch {
      return [];
    }
  }

  private extractArticleList(content: string): any[] {
    // content is now unescaped. Extract the articleList JSON array using
    // bracket-balanced scanning with proper string-awareness.
    const artKey = '"articleList":[';
    const artIdx = content.indexOf(artKey);
    if (artIdx === -1) return [];

    const arrayStart = artIdx + artKey.length - 1; // points to '['
    let depth = 0;
    let inString = false;
    let i = arrayStart;

    while (i < content.length) {
      const ch = content[i];
      if (ch === '\\') { i += 2; continue; }           // skip escaped char
      if (ch === '"') { inString = !inString; i++; continue; }
      if (!inString) {
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) break; }
      }
      i++;
    }

    try {
      return JSON.parse(content.slice(arrayStart, i + 1));
    } catch {
      return [];
    }
  }

  private mapArticleToPost(article: any): Post | null {
    try {
      const slug: string = article.slug;
      const boTable: string = article.boTable;
      if (!slug || !boTable) return null;

      const title: string = article.subject || '';
      if (!title) return null;

      const url = `${this.baseUrl}/b/${boTable}/view/${slug}`;

      const rawThumb: string | undefined = article.thumbnail;
      const thumbnail = rawThumb
        ? rawThumb.startsWith('http')
          ? rawThumb
          : `${this.cdnBase}${rawThumb}`
        : undefined;

      const createdAt = article.writeDateTimestamp
        ? new Date(article.writeDateTimestamp)
        : new Date();

      return {
        id: '',
        title,
        author: article.member?.nickname || '익명',
        site: this.siteName,
        url,
        viewCount: article.viewCount ?? 0,
        commentCount: article.commentCount ?? 0,
        likeCount: article.recommendCount ?? 0,
        createdAt,
        fetchedAt: new Date(),
        thumbnail,
        category: article.category,
      };
    } catch {
      return null;
    }
  }
}
