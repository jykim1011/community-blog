import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShareButton } from '@/components/share-button';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import analysisData from '@/data/analysis.json';

const analysis = analysisData as {
  generatedAt: string;
  communityProfiles: {
    name: string;
    displayName: string;
    description: string;
    category: string;
    primaryTopics: string[];
    postCount: number;
    avgViewCount: number;
    avgCommentCount: number;
    avgLikeCount: number;
    activityScore: number;
    peakHours: number[];
  }[];
  categoryGroups: Record<string, {
    name: string;
    displayName: string;
    category: string;
    activityScore: number;
  }[]>;
};

export const metadata = {
  title: `커뮤니티 가이드 - ${SITE_NAME}`,
  description: '한국 주요 커뮤니티 17곳의 특징, 문화, 주요 토픽을 상세히 비교 분석합니다. 각 커뮤니티의 차이점과 이용 팁을 확인하세요.',
  openGraph: {
    title: `커뮤니티 가이드 - ${SITE_NAME}`,
    description: '한국 주요 커뮤니티 17곳의 특징, 문화, 주요 토픽을 상세히 비교 분석합니다.',
    url: `${SITE_URL}/communities`,
  },
};

export default function CommunitiesPage() {
  const { communityProfiles, categoryGroups } = analysis;
  const generatedDate = new Date(analysis.generatedAt);

  // 활동 점수 순으로 정렬
  const sortedProfiles = [...communityProfiles].sort((a, b) => b.activityScore - a.activityScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🌐 한국 커뮤니티 가이드
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                17개 주요 커뮤니티의 특징, 문화, 주요 토픽을 상세히 비교합니다.
                <span className="ml-2 text-xs">
                  업데이트: {generatedDate.toLocaleString('ko-KR')}
                </span>
              </p>
            </div>
            <ShareButton
              title="한국 커뮤니티 가이드"
              url={`${SITE_URL}/communities`}
            />
          </div>
        </div>

        {/* 카테고리별 그룹 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📂 카테고리별 분류
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(categoryGroups).map(([category, profiles]) => (
              <div
                key={category}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {category}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {profiles.length}개 커뮤니티
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 커뮤니티 상세 프로필 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 커뮤니티별 상세 프로필 (활동 순)
          </h2>

          <div className="space-y-4">
            {sortedProfiles.map((profile, index) => (
              <div
                key={profile.name}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6"
              >
                {/* 헤더 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {profile.displayName}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        {profile.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.description}
                    </p>
                  </div>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">게시글</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile.postCount}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">평균 조회</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile.avgViewCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">평균 댓글</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile.avgCommentCount}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">평균 좋아요</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile.avgLikeCount}
                    </div>
                  </div>
                </div>

                {/* 주요 토픽 */}
                {profile.primaryTopics.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      주요 토픽
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.primaryTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 피크 시간대 */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  🕐 가장 활발한 시간대: {profile.peakHours.map(h => `${h}시`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 이용 팁 */}
        <section className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            💡 커뮤니티 이용 팁
          </h2>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                1. 커뮤니티별 문화 존중하기
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                각 커뮤니티는 고유의 문화와 규칙이 있습니다.
                처음 방문하는 커뮤니티라면 공지사항과 규칙을 먼저 읽어보세요.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                2. 정보의 신뢰성 검증
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                커뮤니티 게시글은 개인의 의견이나 경험담이 많습니다.
                중요한 정보는 여러 출처를 통해 교차 검증하세요.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                3. 건전한 토론 문화 만들기
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                다른 의견을 존중하고, 공격적인 언행은 자제해주세요.
                건전한 토론 문화가 양질의 콘텐츠를 만듭니다.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                4. 개인정보 보호 주의
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                익명 커뮤니티라도 개인을 특정할 수 있는 정보는 공개하지 마세요.
                개인정보 유출에 주의하며 안전하게 이용하세요.
              </p>
            </div>
          </div>
        </section>

        {/* 하단 설명 */}
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
            🌐 데이터 기반 커뮤니티 분석
          </h3>
          <p className="text-xs text-indigo-800 dark:text-indigo-400 leading-relaxed">
            본 가이드는 17개 커뮤니티의 실시간 데이터를 수집하여 자동으로 생성됩니다.
            각 커뮤니티의 게시글 수, 조회수, 댓글, 좋아요, 활동 시간대 등을 분석하여
            객관적인 데이터를 제공합니다. 30분마다 자동 업데이트됩니다.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
