import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShareButton } from '@/components/share-button';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import analysisData from '@/data/analysis.json';
import postsData from '@/data/posts.json';
import type { StaticPost } from '@/lib/types';

const analysis = analysisData as {
  generatedAt: string;
  keywords: { word: string; frequency: number; tfidf: number; relatedPosts: string[] }[];
};

const posts: StaticPost[] = postsData as StaticPost[];

export const metadata = {
  title: `인기 키워드 - ${SITE_NAME}`,
  description: '한국 커뮤니티에서 가장 많이 언급되는 인기 키워드를 탐색하세요. 각 키워드와 관련된 게시글을 확인할 수 있습니다.',
  openGraph: {
    title: `인기 키워드 - ${SITE_NAME}`,
    description: '한국 커뮤니티에서 가장 많이 언급되는 인기 키워드를 탐색하세요.',
    url: `${SITE_URL}/keywords`,
  },
};

export default function KeywordsPage() {
  const generatedDate = new Date(analysis.generatedAt);
  const keywords = analysis.keywords;
  const postsMap = new Map(posts.map(p => [p.id, p]));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🔍 인기 키워드 탐색
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                지금 커뮤니티에서 가장 많이 언급되는 키워드 {keywords.length}개
                <span className="ml-2 text-xs">
                  업데이트: {generatedDate.toLocaleString('ko-KR')}
                </span>
              </p>
            </div>
            <ShareButton
              title="커뮤니티 인기 키워드"
              url={`${SITE_URL}/keywords`}
            />
          </div>
        </div>

        {/* 키워드 목록 */}
        <div className="space-y-4">
          {keywords.map((keyword, index) => {
            const relatedPosts = keyword.relatedPosts
              .map(id => postsMap.get(id))
              .filter(Boolean)
              .slice(0, 5) as StaticPost[];

            return (
              <div
                key={keyword.word}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5"
              >
                {/* 키워드 헤더 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {keyword.word}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{keyword.frequency}회 언급</span>
                      <span>·</span>
                      <span>관련 게시글 {relatedPosts.length}개</span>
                    </div>
                  </div>
                </div>

                {/* 관련 게시글 */}
                {relatedPosts.length > 0 && (
                  <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    {relatedPosts.map((post) => (
                      <a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                      >
                        → {post.title.replace(/\[.*?\]/g, '').trim()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 설명 */}
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
            🔑 키워드 추출 방법
          </h3>
          <p className="text-xs text-purple-800 dark:text-purple-400 leading-relaxed">
            TF-IDF(Term Frequency-Inverse Document Frequency) 알고리즘을 사용하여
            단순히 많이 등장하는 단어가 아닌, 각 커뮤니티에서의 상대적 중요도를 고려하여 키워드를 추출합니다.
            이를 통해 더 의미 있고 트렌드를 반영하는 키워드를 발견할 수 있습니다.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
