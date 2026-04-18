import axios from 'axios';

interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
}

class RobotsChecker {
  private cache: Map<string, RobotsRule[]> = new Map();

  /**
   * robots.txt를 파싱하여 규칙 추출
   */
  private parseRobotsTxt(content: string): RobotsRule[] {
    const rules: RobotsRule[] = [];
    let currentRule: RobotsRule | null = null;

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // 주석 제거
      const commentIndex = trimmed.indexOf('#');
      const cleaned = commentIndex >= 0 ? trimmed.substring(0, commentIndex).trim() : trimmed;

      if (!cleaned) continue;

      const [key, ...valueParts] = cleaned.split(':');
      const value = valueParts.join(':').trim();

      const lowerKey = key.toLowerCase().trim();

      if (lowerKey === 'user-agent') {
        if (currentRule) {
          rules.push(currentRule);
        }
        currentRule = {
          userAgent: value,
          disallow: [],
          allow: [],
        };
      } else if (currentRule) {
        if (lowerKey === 'disallow') {
          currentRule.disallow.push(value);
        } else if (lowerKey === 'allow') {
          currentRule.allow.push(value);
        } else if (lowerKey === 'crawl-delay') {
          currentRule.crawlDelay = parseInt(value);
        }
      }
    }

    if (currentRule) {
      rules.push(currentRule);
    }

    return rules;
  }

  /**
   * robots.txt 가져오기 (캐싱)
   */
  async getRobotsTxt(baseUrl: string): Promise<RobotsRule[]> {
    // 캐시 확인
    if (this.cache.has(baseUrl)) {
      return this.cache.get(baseUrl)!;
    }

    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 404) {
        console.log(`[RobotsChecker] No robots.txt found at ${baseUrl}`);
        // robots.txt가 없으면 모든 크롤링 허용
        const defaultRule: RobotsRule[] = [
          {
            userAgent: '*',
            disallow: [],
            allow: ['/'],
          },
        ];
        this.cache.set(baseUrl, defaultRule);
        return defaultRule;
      }

      const rules = this.parseRobotsTxt(response.data);
      this.cache.set(baseUrl, rules);

      console.log(`[RobotsChecker] Loaded robots.txt from ${baseUrl}: ${rules.length} rules`);
      return rules;
    } catch (error) {
      console.warn(`[RobotsChecker] Failed to fetch robots.txt from ${baseUrl}:`, (error as Error).message);
      // 에러 시 모든 크롤링 허용 (보수적 접근)
      const defaultRule: RobotsRule[] = [
        {
          userAgent: '*',
          disallow: [],
          allow: ['/'],
        },
      ];
      this.cache.set(baseUrl, defaultRule);
      return defaultRule;
    }
  }

  /**
   * URL이 크롤링 가능한지 확인
   */
  async canCrawl(url: string, userAgent: string = '*'): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      const path = urlObj.pathname + urlObj.search;

      const rules = await this.getRobotsTxt(baseUrl);

      // 해당 User-Agent 규칙 찾기 (우선순위: 특정 UA > *)
      let applicableRule = rules.find((r) => r.userAgent.toLowerCase() === userAgent.toLowerCase());
      if (!applicableRule) {
        applicableRule = rules.find((r) => r.userAgent === '*');
      }

      if (!applicableRule) {
        // 규칙이 없으면 허용
        return true;
      }

      // Allow 규칙 확인 (우선순위 높음)
      for (const allowPattern of applicableRule.allow) {
        if (this.matchesPattern(path, allowPattern)) {
          return true;
        }
      }

      // Disallow 규칙 확인
      for (const disallowPattern of applicableRule.disallow) {
        if (disallowPattern === '' || disallowPattern === '/') {
          // 빈 문자열이면 허용, '/'는 전체 차단
          continue;
        }
        if (this.matchesPattern(path, disallowPattern)) {
          return false;
        }
      }

      // 기본값: 허용
      return true;
    } catch (error) {
      console.warn(`[RobotsChecker] Error checking ${url}:`, (error as Error).message);
      // 에러 시 허용 (보수적)
      return true;
    }
  }

  /**
   * 패턴 매칭 (와일드카드 지원)
   */
  private matchesPattern(path: string, pattern: string): boolean {
    if (pattern === '') return false;
    if (pattern === '/') return path.startsWith('/');

    // 와일드카드를 정규식으로 변환
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 정규식 특수문자 이스케이프
      .replace(/\*/g, '.*') // * -> .*
      .replace(/\$/g, '$'); // $ 는 끝을 의미

    const regex = new RegExp('^' + regexPattern);
    return regex.test(path);
  }

  /**
   * Crawl-Delay 가져오기
   */
  async getCrawlDelay(baseUrl: string, userAgent: string = '*'): Promise<number | undefined> {
    const rules = await this.getRobotsTxt(baseUrl);

    let applicableRule = rules.find((r) => r.userAgent.toLowerCase() === userAgent.toLowerCase());
    if (!applicableRule) {
      applicableRule = rules.find((r) => r.userAgent === '*');
    }

    return applicableRule?.crawlDelay;
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const robotsChecker = new RobotsChecker();
