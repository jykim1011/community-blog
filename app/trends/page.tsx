import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShareButton } from '@/components/share-button';
import { AdMobBanner } from '@/components/admob-banner';
import { BottomAdContainer } from '@/components/bottom-ad-container';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import analysisData from '@/data/analysis.json';

const analysis = analysisData as {
  generatedAt: string;
  keywords: { word: string; frequency: number; tfidf: number }[];
  dailyTrends: { date: string; postCount: number; avgViewCount: number; topKeyword: string }[];
  siteTrends: { siteName: string; displayName: string; postCount: number; avgViewCount: number }[];
};

export const metadata = {
  title: `트렌드 분석 - ${SITE_NAME}`,
  description: '한국 커뮤니티의 실시간 트렌드를 분석합니다. 인기 키워드, 일별 활동 추이, 커뮤니티별 인기 토픽을 한눈에 확인하세요.',
  openGraph: {
    title: `트렌드 분석 - ${SITE_NAME}`,
    description: '한국 커뮤니티의 실시간 트렌드를 분석합니다.',
    url: `${SITE_URL}/trends`,
  },
};

export default function TrendsPage() {
  const generatedDate = new Date(analysis.generatedAt);
  const topKeywords = analysis.keywords.slice(0, 20);
  const recentTrends = analysis.dailyTrends.slice(0, 7);
  const topSites = analysis.siteTrends.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 sm:pb-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📊 실시간 커뮤니티 트렌드
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                22개 커뮤니티의 실시간 데이터를 분석한 결과입니다.
                <span className="ml-2 text-xs">
                  마지막 업데이트: {generatedDate.toLocaleString('ko-KR')}
                </span>
              </p>
            </div>
            <ShareButton
              title="커뮤니티 트렌드 분석"
              url={`${SITE_URL}/trends`}
            />
          </div>
        </div>

        {/* 인기 키워드 TOP 20 */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            지금 가장 뜨거운 키워드 TOP 20
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topKeywords.map((keyword, index) => (
              <div
                key={keyword.word}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : index === 1
                        ? 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        : index === 2
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {keyword.word}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
            💡 <strong>TF-IDF 알고리즘</strong>을 사용하여 단순 빈도가 아닌, 각 커뮤니티에서의 중요도를 고려하여 키워드를 추출합니다.
          </p>
        </section>

        {/* 일별 활동 추이 */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            최근 7일 활동 추이
          </h2>

          <div className="space-y-3">
            {recentTrends.map((trend) => {
              const date = new Date(trend.date);
              const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
              const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={trend.date}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{dayName}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{dateStr}</div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">평균 조회</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {trend.avgViewCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">인기 키워드</div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {trend.topKeyword || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 커뮤니티별 활동 */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            가장 활발한 커뮤니티 TOP 10
          </h2>

          <div className="space-y-2">
            {topSites.map((site, index) => {
              const percentage = (site.postCount / topSites[0].postCount) * 100;

              return (
                <div key={site.siteName} className="relative">
                  <div
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 rounded-lg"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {site.displayName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      평균 조회 <strong className="text-gray-900 dark:text-white">{site.avgViewCount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 하단 설명 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            🤖 AI 기반 크로스 커뮤니티 트렌드 분석
          </h3>
          <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
            본 페이지는 한국 주요 커뮤니티의 실시간 데이터를 수집하여 자동으로 생성됩니다.
            TF-IDF 알고리즘으로 중요 키워드를 추출하고, 일별/커뮤니티별 활동 패턴을 분석하여
            한국 인터넷 커뮤니티의 전체적인 흐름을 한눈에 파악할 수 있습니다.
            30분마다 자동 업데이트됩니다.
          </p>
        </div>
      </main>

      {/* 하단 광고 (앱: AdMob, 웹: AdSense) */}
      <AdMobBanner position="bottom" />
      <BottomAdContainer />

      <SiteFooter />
    </div>
  );
}
