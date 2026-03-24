import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_NAME, SITE_DESCRIPTION, siteConfigs } from '@/lib/constants';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: `${SITE_NAME} - 한국 인기 커뮤니티 게시글을 한곳에서 모아보는 서비스입니다.`,
};

const communityCategories = [
  {
    category: 'IT / 테크',
    sites: ['clien', 'slrclub', 'inven'],
    description: '클리앙, SLR클럽 등 기술 커뮤니티의 최신 IT 소식과 리뷰',
  },
  {
    category: '유머 / 엔터테인먼트',
    sites: ['humoruniv', 'todayhumor', 'ilbe', 'dcinside', 'hygall'],
    description: '웃긴대학, 오늘의유머, 디시인사이드 등 유머와 엔터 소식',
  },
  {
    category: '생활 / 쇼핑',
    sites: ['ppomppu', 'cook82', 'bobaedream', 'natepann'],
    description: '뽐뿌 핫딜, 82쿡 생활정보, 보배드림 자동차 등 생활 밀착 정보',
  },
  {
    category: '게임 / 서브컬처',
    sites: ['ruliweb', 'inven', 'theqoo'],
    description: '루리웹, 인벤 게임 소식과 더쿠 팬덤 커뮤니티',
  },
  {
    category: '종합 / 시사',
    sites: ['mlbpark', 'etoland', 'gasengi'],
    description: '엠팍, 이토랜드, 가생이 등 종합 토론 커뮤니티',
  },
];

export default function AboutPage() {
  const totalSites = Object.keys(siteConfigs).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 서비스 소개 */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {SITE_NAME} 소개
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              <strong>{SITE_NAME}</strong>은 한국의 주요 온라인 커뮤니티 {totalSites}곳의
              인기 게시글을 자동으로 수집하여 한곳에서 편리하게 모아보는 서비스입니다.
            </p>
            <p>
              매일 수천 개의 게시글이 올라오는 다양한 커뮤니티를 일일이 방문하기 어려운 분들을 위해,
              각 커뮤니티에서 화제가 되고 있는 인기 게시글만 선별하여 보여드립니다.
              조회수, 댓글 수, 추천 수를 종합적으로 분석하여 실시간으로 트렌드를 파악할 수 있습니다.
            </p>
            <p>
              30분마다 자동으로 최신 인기글을 업데이트하며, 인기순, 댓글순, 최신순으로
              정렬하여 원하는 방식으로 콘텐츠를 탐색할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: '실시간 인기글 수집',
                desc: '30분 간격으로 각 커뮤니티의 인기 게시글을 자동 수집합니다. 조회수, 댓글, 추천 수 기반으로 화제성 높은 글만 선별합니다.',
              },
              {
                title: '커뮤니티별 필터링',
                desc: `${totalSites}개 커뮤니티를 개별 또는 통합으로 볼 수 있습니다. 관심 있는 커뮤니티만 선택하여 맞춤 피드를 구성하세요.`,
              },
              {
                title: '다양한 정렬 옵션',
                desc: '인기순(조회+댓글+추천 종합), 댓글순, 최신순 정렬을 지원하여 원하는 기준으로 게시글을 탐색할 수 있습니다.',
              },
              {
                title: '반응형 디자인',
                desc: 'PC에서는 페이지네이션, 모바일에서는 무한 스크롤로 최적화된 탐색 경험을 제공합니다. 다크모드도 지원합니다.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5"
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 수집 커뮤니티 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            수집 대상 커뮤니티
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
              다양한 분야의 한국 대표 커뮤니티에서 인기 게시글을 수집합니다.
              각 커뮤니티의 특색 있는 콘텐츠를 한곳에서 비교하며 볼 수 있습니다.
            </p>
            <div className="space-y-5">
              {communityCategories.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {cat.category}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    {cat.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.sites.map((siteKey) => {
                      const config = siteConfigs[siteKey];
                      if (!config) return null;
                      return (
                        <span
                          key={siteKey}
                          className="inline-block px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {config.displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 운영 원칙 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            운영 원칙
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                저작권 존중
              </h3>
              <p className="text-sm">
                모든 게시글의 저작권은 원본 사이트와 작성자에게 있습니다.
                본 서비스는 게시글의 제목, 메타 정보(조회수, 댓글 수, 추천 수)와
                원문 링크만 제공하며, 게시글 본문은 수집하지 않습니다.
                게시글 클릭 시 원본 사이트로 바로 이동합니다.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                품질 관리
              </h3>
              <p className="text-sm">
                단순히 모든 게시글을 나열하는 것이 아니라, 조회수, 댓글 수, 추천 수를
                기반으로 인기도를 분석하여 화제성 있는 게시글만 선별합니다.
                이를 통해 각 커뮤니티에서 실제로 주목받는 콘텐츠만 확인할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                개인정보 보호
              </h3>
              <p className="text-sm">
                회원가입이나 로그인이 필요 없으며, 개인정보를 수집하지 않습니다.
                누구나 자유롭게 서비스를 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* 사용 방법 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            사용 방법
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-3 text-gray-700 dark:text-gray-300">
            <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
              <li>
                <strong>전체 인기글 보기:</strong> 메인 페이지에서 모든 커뮤니티의 인기글을 한번에 확인할 수 있습니다.
                라운드로빈 방식으로 각 커뮤니티의 글이 골고루 표시됩니다.
              </li>
              <li>
                <strong>커뮤니티 선택:</strong> 상단의 커뮤니티 탭을 클릭하여 특정 커뮤니티의
                인기글만 필터링할 수 있습니다.
              </li>
              <li>
                <strong>정렬 변경:</strong> 인기순, 댓글순, 최신순 중 원하는 정렬 기준을 선택하세요.
              </li>
              <li>
                <strong>원문 확인:</strong> 게시글 제목을 클릭하면 해당 커뮤니티의 원본 게시글로 바로 이동합니다.
              </li>
            </ol>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
