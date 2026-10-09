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
    // 연속된 User-agent 줄은 하나의 그룹으로 같은 규칙을 공유한다.
    let group: RobotsRule[] = [];
    let lastWasUserAgent = false;

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
        if (!lastWasUserAgent) group = [];
        currentRule = { userAgent: value, disallow: [], allow: [] };
        group.push(currentRule);
        rules.push(currentRule);
        lastWasUserAgent = true;
      } else if (currentRule) {
        lastWasUserAgent = false;
        for (const rule of group) {
          if (lowerKey === 'disallow') {
            rule.disallow.push(value);
          } else if (lowerKey === 'allow') {
            rule.allow.push(value);
          } else if (lowerKey === 'crawl-delay') {
            rule.crawlDelay = parseInt(value);
          }
        }
      }
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
      const token = userAgent.split('/')[0].toLowerCase();
      let applicableRule = rules.find((r) => r.userAgent.toLowerCase() === token);
      if (!applicableRule) {
        applicableRule = rules.find((r) => r.userAgent === '*');
      }

      if (!applicableRule) {
        // 규칙이 없으면 허용
        return true;
      }

      // RFC 9309: 가장 길게(구체적으로) 일치하는 규칙이 이기고, 길이가 같으면 Allow 가 이긴다.
      // 예전 코드는 'Disallow: /' 를 건너뛰어, 모든 봇을 막은 사이트도 허용으로 판정했다.
      let bestLen = -1;
      let bestAllow = true;
      const consider = (pattern: string, allow: boolean) => {
        if (!this.matchesPattern(path, pattern)) return;
        if (pattern.length > bestLen || (pattern.length === bestLen && allow)) {
          bestLen = pattern.length;
          bestAllow = allow;
        }
      };
      applicableRule.allow.forEach((p) => consider(p, true));
      applicableRule.disallow.forEach((p) => consider(p, false));
      if (bestLen >= 0) return bestAllow;

      // 일치하는 규칙 없음: 허용
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
    // 끝의 $ 는 경로 끝 앵커
    const anchored = pattern.endsWith('$');
    const body = anchored ? pattern.slice(0, -1) : pattern;
    const regexPattern = body
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 정규식 특수문자 이스케이프
      .replace(/\*/g, '.*'); // * -> .*

    const regex = new RegExp('^' + regexPattern + (anchored ? '$' : ''));
    return regex.test(path);
  }

  /**
   * Crawl-Delay 가져오기
   */
  async getCrawlDelay(baseUrl: string, userAgent: string = '*'): Promise<number | undefined> {
    const rules = await this.getRobotsTxt(baseUrl);

    const token = userAgent.split('/')[0].toLowerCase();
    let applicableRule = rules.find((r) => r.userAgent.toLowerCase() === token);
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
