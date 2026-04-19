'use client';

import type { StaticPost, StaticSite } from '@/lib/types';

interface TrendSummaryProps {
  posts: StaticPost[];
  sites: StaticSite[];
}

// 한국어 불용어 (키워드 추출 시 제외)
const STOP_WORDS = new Set([
  '이', '그', '저', '것', '수', '등', '때', '중', '더', '좀', '잘', '못', '안',
  '의', '를', '을', '에', '에서', '와', '과', '도', '는', '은', '가', '이',
  '한', '하는', '하고', '하면', '해서', '했다', '합니다', '있는', '없는',
  '되는', '된', '될', '대한', '위한', '통한', '따른',
  'ㅋㅋ', 'ㅋㅋㅋ', 'ㅎㅎ', 'ㅎㅎㅎ', 'ㄷㄷ', 'ㅇㅇ',
  'jpg', 'gif', 'png', 'mp4', 'the', 'and', 'for', 'that', 'this',
]);

function extractKeywords(posts: StaticPost[]): { word: string; count: number }[] {
  const wordCount = new Map<string, number>();

  for (const post of posts) {
    // 제목에서 키워드 추출 (카테고리 태그 제거)
    const title = post.title.replace(/\[.*?\]/g, '').trim();
    // 2글자 이상 한글 단어 또는 영문 단어 추출
    const words = title.match(/[가-힣]{2,}|[a-zA-Z]{3,}/g) || [];

    const seen = new Set<string>();
    for (const word of words) {
      const lower = word.toLowerCase();
      if (!STOP_WORDS.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        wordCount.set(lower, (wordCount.get(lower) || 0) + 1);
      }
    }
  }

  return Array.from(wordCount.entries())
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
}

function getTopCommunities(posts: StaticPost[], sites: StaticSite[]): { name: string; displayName: string; count: number }[] {
  const siteCount = new Map<string, number>();
  for (const post of posts) {
    siteCount.set(post.site, (siteCount.get(post.site) || 0) + 1);
  }

  const siteMap = new Map(sites.map(s => [s.name, s.displayName]));

  return Array.from(siteCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      displayName: siteMap.get(name) || name,
      count,
    }));
}

function getHottestPosts(posts: StaticPost[]): StaticPost[] {
  return [...posts]
    .map(post => ({
      ...post,
      _score: (post.viewCount || 0) * 0.1 + (post.commentCount || 0) * 5 + (post.likeCount || 0) * 2,
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 7);
}

export function TrendSummary({ posts, sites }: TrendSummaryProps) {
  const keywords = extractKeywords(posts);
  const topCommunities = getTopCommunities(posts, sites);
  const hottestPosts = getHottestPosts(posts);

  if (posts.length === 0) return null;

  return (
    <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-4">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
        오늘의 커뮤니티 트렌드
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* 인기 키워드 */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <span className="text-sm sm:text-base">🔑</span> 인기 키워드
          </h3>
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {keywords.slice(0, 5).map((kw, i) => (
                <span
                  key={kw.word}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    i === 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : i === 1
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {kw.word}
                  <span className="text-[10px] opacity-70">{kw.count}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">데이터 수집 중...</p>
          )}
        </div>

        {/* 활발한 커뮤니티 */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <span className="text-sm sm:text-base">📊</span> 활발한 커뮤니티
          </h3>
          <div className="space-y-1.5">
            {topCommunities.map((community, i) => (
              <div key={community.name} className="flex items-center justify-between">
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 dark:text-gray-500 mr-1.5">{i + 1}.</span>
                  {community.displayName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {community.count}건
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 에디터 픽 */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base">🔥</span> 지금 가장 뜨거운 글
            </span>
            <a href="/hot" className="text-[10px] text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-normal">
              전체보기 →
            </a>
          </h3>
          <div className="space-y-1.5">
            {hottestPosts.map((post, i) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start gap-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 leading-relaxed">
                    {post.title.replace(/\[.*?\]/g, '').trim()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {sites.length}개 커뮤니티에서 수집한 {posts.length.toLocaleString()}개 게시글을 분석한 결과입니다. 30분마다 자동 업데이트됩니다.
      </p>
    </section>
  );
}
