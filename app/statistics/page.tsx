import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShareButton } from '@/components/share-button';
import { AdMobBanner } from '@/components/admob-banner';
import { BottomAdContainer } from '@/components/bottom-ad-container';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import analysisData from '@/data/analysis.json';

const analysis = analysisData as {
  generatedAt: string;
  overallStats: {
    totalPosts: number;
    totalViews: number;
    totalComments: number;
    totalLikes: number;
    avgViewsPerPost: number;
    avgCommentsPerPost: number;
    avgLikesPerPost: number;
    mostActiveSite: string;
    mostActiveHour: number;
    engagementRate: number;
  };
  hourlyTrends: { hour: number; postCount: number }[];
  siteTrends: { siteName: string; displayName: string; postCount: number; avgViewCount: number; avgCommentCount: number; avgLikeCount: number }[];
  communityProfiles: { name: string; displayName: string; category: string; activityScore: number }[];
};

export const metadata = {
  title: `통계 대시보드 - ${SITE_NAME}`,
  description: '한국 커뮤니티의 전체 통계와 활동 지표를 시각화합니다. 게시글 수, 조회수, 댓글, 좋아요 등 다양한 메트릭을 확인하세요.',
  openGraph: {
    title: `통계 대시보드 - ${SITE_NAME}`,
    description: '한국 커뮤니티의 전체 통계와 활동 지표를 시각화합니다.',
    url: `${SITE_URL}/statistics`,
  },
};

export default function StatisticsPage() {
  const { overallStats, hourlyTrends, siteTrends, communityProfiles } = analysis;
  const generatedDate = new Date(analysis.generatedAt);

  // 시간대별 최대값 계산
  const maxHourlyPosts = Math.max(...hourlyTrends.map(h => h.postCount));

  // 카테고리별 그룹화
  const categoryGroups = communityProfiles.reduce((acc, profile) => {
    if (!acc[profile.category]) acc[profile.category] = [];
    acc[profile.category].push(profile);
    return acc;
  }, {} as Record<string, typeof communityProfiles>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 sm:pb-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📊 통계 대시보드
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                한국 커뮤니티의 전체 활동 지표를 한눈에 확인하세요.
                <span className="ml-2 text-xs">
                  업데이트: {generatedDate.toLocaleString('ko-KR')}
                </span>
              </p>
            </div>
            <ShareButton
              title="커뮤니티 통계 대시보드"
              url={`${SITE_URL}/statistics`}
            />
          </div>
        </div>

        {/* 전체 통계 요약 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 게시글</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {overallStats.totalPosts.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              17개 커뮤니티
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 조회수</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {(overallStats.totalViews / 10000).toFixed(1)}만
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              평균 {overallStats.avgViewsPerPost.toLocaleString()}회
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 댓글</div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
              {overallStats.totalComments.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              평균 {overallStats.avgCommentsPerPost}개
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 좋아요</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {overallStats.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              평균 {overallStats.avgLikesPerPost}개
            </div>
          </div>
        </section>

        {/* 시간대별 활동 */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            시간대별 활동 분포
          </h2>

          <div className="space-y-1.5">
            {hourlyTrends.map((trend) => {
              const percentage = (trend.postCount / maxHourlyPosts) * 100;
              const isPeak = trend.hour === overallStats.mostActiveHour;

              return (
                <div key={trend.hour} className="flex items-center gap-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12">
                    {trend.hour}시
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 dark:bg-gray-700 rounded">
                    <div
                      className={`absolute inset-y-0 left-0 rounded transition-all ${
                        isPeak
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                          : 'bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-900/50 dark:to-blue-900/30'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-semibold ${isPeak ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {trend.postCount}건
                        {isPeak && ' 🔥'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
            💡 가장 활발한 시간대: <strong className="text-blue-600 dark:text-blue-400">{overallStats.mostActiveHour}시</strong>
            {' '}({hourlyTrends.find(h => h.hour === overallStats.mostActiveHour)?.postCount || 0}건)
          </p>
        </section>

        {/* 커뮤니티별 상세 통계 */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            커뮤니티별 상세 지표
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-semibold">순위</th>
                  <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-semibold">커뮤니티</th>
                  <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400 font-semibold">게시글</th>
                  <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400 font-semibold">평균 조회</th>
                  <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400 font-semibold">평균 댓글</th>
                  <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400 font-semibold">평균 좋아요</th>
                </tr>
              </thead>
              <tbody>
                {siteTrends.map((site, index) => (
                  <tr key={site.siteName} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 px-2 text-gray-500 dark:text-gray-500">{index + 1}</td>
                    <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{site.displayName}</td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{site.postCount}</td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{site.avgViewCount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{site.avgCommentCount}</td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{site.avgLikeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 카테고리별 분포 */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            카테고리별 분포
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(categoryGroups).map(([category, profiles]) => {
              const totalPosts = profiles.reduce((sum, p) => sum + (siteTrends.find(s => s.siteName === p.name)?.postCount || 0), 0);

              return (
                <div key={category} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{category}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {totalPosts.toLocaleString()}건
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {profiles.length}개 커뮤니티
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 하단 설명 */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
            📊 데이터 기반 인사이트
          </h3>
          <p className="text-xs text-green-800 dark:text-green-400 leading-relaxed">
            본 통계는 17개 커뮤니티의 실시간 데이터를 수집하여 자동으로 생성됩니다.
            게시글 수, 조회수, 댓글, 좋아요 등 다양한 메트릭을 분석하여
            한국 인터넷 커뮤니티의 전체적인 활동 패턴을 파악할 수 있습니다.
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
