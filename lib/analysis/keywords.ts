import type { StaticPost } from '@/lib/types';

export interface KeywordAnalysis {
  word: string;
  frequency: number;
  tfidf: number;
  relatedPosts: string[]; // post IDs
}

// 한국어 불용어 (확장 버전)
const STOP_WORDS = new Set([
  '이', '그', '저', '것', '수', '등', '때', '중', '더', '좀', '잘', '못', '안',
  '의', '를', '을', '에', '에서', '와', '과', '도', '는', '은', '가', '이',
  '한', '하는', '하고', '하면', '해서', '했다', '합니다', '있는', '없는',
  '되는', '된', '될', '대한', '위한', '통한', '따른', '같은', '있다', '없다',
  '한테', '에게', '께서', '부터', '까지', '마저', '조차', '마나', '커녕',
  'ㅋㅋ', 'ㅋㅋㅋ', 'ㅎㅎ', 'ㅎㅎㅎ', 'ㄷㄷ', 'ㅇㅇ', 'ㄹㅇ', 'ㄱㄱ',
  'jpg', 'gif', 'png', 'mp4', 'the', 'and', 'for', 'that', 'this', 'with',
  '있음', '없음', '이거', '저거', '뭐', '어떻게', '왜', '어디', '언제',
]);

/**
 * TF-IDF 기반 키워드 추출
 */
export function analyzeKeywords(posts: StaticPost[], topN: number = 20): KeywordAnalysis[] {
  const wordCount = new Map<string, number>();
  const wordDocs = new Map<string, Set<string>>();
  const wordPosts = new Map<string, Set<string>>();

  // 단어 빈도 계산 (TF)
  for (const post of posts) {
    const title = post.title.replace(/\[.*?\]/g, '').trim();
    const words = title.match(/[가-힣]{2,}|[a-zA-Z]{3,}/g) || [];

    const seenInPost = new Set<string>();
    for (const word of words) {
      const lower = word.toLowerCase();
      if (STOP_WORDS.has(lower)) continue;

      // 전체 빈도
      wordCount.set(lower, (wordCount.get(lower) || 0) + 1);

      // 문서 빈도 (한 게시글에서 한 번만 카운트)
      if (!seenInPost.has(lower)) {
        if (!wordDocs.has(lower)) wordDocs.set(lower, new Set());
        wordDocs.get(lower)!.add(post.id);
        seenInPost.add(lower);
      }

      // 관련 게시글 ID 저장
      if (!wordPosts.has(lower)) wordPosts.set(lower, new Set());
      wordPosts.get(lower)!.add(post.id);
    }
  }

  // TF-IDF 계산
  const totalDocs = posts.length;
  const results: KeywordAnalysis[] = [];

  for (const [word, tf] of wordCount.entries()) {
    const df = wordDocs.get(word)?.size || 0;
    if (df === 0) continue;

    const idf = Math.log((totalDocs + 1) / (df + 1)) + 1;
    const tfidf = tf * idf;

    results.push({
      word,
      frequency: tf,
      tfidf,
      relatedPosts: Array.from(wordPosts.get(word) || []).slice(0, 10),
    });
  }

  return results
    .sort((a, b) => b.tfidf - a.tfidf)
    .slice(0, topN);
}

/**
 * 키워드 변화 추적 (이전 주 대비)
 */
export function trackKeywordChanges(
  currentPosts: StaticPost[],
  previousPosts: StaticPost[]
): { word: string; change: 'up' | 'down' | 'new'; currentRank: number; previousRank: number | null }[] {
  const currentKeywords = analyzeKeywords(currentPosts, 50);
  const previousKeywords = analyzeKeywords(previousPosts, 50);

  const currentRanks = new Map(currentKeywords.map((k, i) => [k.word, i + 1]));
  const previousRanks = new Map(previousKeywords.map((k, i) => [k.word, i + 1]));

  const changes: { word: string; change: 'up' | 'down' | 'new'; currentRank: number; previousRank: number | null }[] = [];

  for (const [word, currentRank] of currentRanks.entries()) {
    const previousRank = previousRanks.get(word);

    if (previousRank === undefined) {
      changes.push({ word, change: 'new', currentRank, previousRank: null });
    } else if (currentRank < previousRank) {
      changes.push({ word, change: 'up', currentRank, previousRank });
    } else if (currentRank > previousRank) {
      changes.push({ word, change: 'down', currentRank, previousRank });
    }
  }

  return changes.sort((a, b) => a.currentRank - b.currentRank);
}
