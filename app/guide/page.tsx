import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: '한국 커뮤니티 가이드',
  description: '클리앙, 더쿠, 루리웹, 디시인사이드 등 한국 주요 커뮤니티의 특징과 문화를 소개합니다.',
};

const communities = [
  {
    name: '클리앙 (Clien)',
    category: 'IT / 테크',
    description:
      '2000년에 개설된 국내 대표 IT 커뮤니티입니다. 원래 카메라/사진 동호회에서 시작했으나, 현재는 IT 기기 리뷰, 소프트웨어 개발, 자유 게시판 등 다양한 주제를 다루고 있습니다. 중도적 성향으로 비교적 차분한 토론 문화를 가지고 있으며, 30~40대 직장인 이용자가 많습니다. "모두의공원" 게시판이 가장 활발합니다.',
  },
  {
    name: '더쿠 (TheQoo)',
    category: '엔터테인먼트 / 팬덤',
    description:
      'K-POP, 드라마, 예능 등 한류 엔터테인먼트 관련 정보가 가장 활발하게 공유되는 커뮤니티입니다. 아이돌 팬덤의 실시간 반응, 방송 캡처, 연예 뉴스 등이 빠르게 올라오며, 10~20대 여성 이용자 비율이 높습니다. 새로운 밈(meme)이 자주 탄생하는 곳이기도 합니다.',
  },
  {
    name: '루리웹 (Ruliweb)',
    category: '게임 / 서브컬처',
    description:
      '1999년에 설립된 한국 최대의 게임 커뮤니티입니다. 콘솔 게임, PC 게임, 모바일 게임 전반에 걸친 리뷰와 공략 정보가 풍부합니다. "유머 게시판"은 루리웹의 트레이드마크로, 게임과 무관한 유머 콘텐츠도 활발합니다. 서브컬처(애니메이션, 만화) 관련 게시판도 인기가 높습니다.',
  },
  {
    name: '디시인사이드 (DCInside)',
    category: '종합',
    description:
      '2000년대 초반부터 한국 인터넷 문화를 선도해온 대형 커뮤니티입니다. "갤러리" 시스템으로 수만 개의 주제별 게시판이 있습니다. 익명성이 높아 솔직하고 직설적인 의견 교환이 이루어지며, 수많은 인터넷 밈과 유행어의 발원지입니다. 주식, 코인, 야구 갤러리 등이 특히 활발합니다.',
  },
  {
    name: '인벤 (Inven)',
    category: '게임',
    description:
      '한국 대표 게임 전문 미디어 겸 커뮤니티입니다. 리그 오브 레전드, 로스트아크, 메이플스토리 등 인기 온라인 게임별로 전문 게시판이 운영됩니다. 공략, 패치 노트, e스포츠 소식 등 게임 관련 심층 콘텐츠가 강점이며, 게임 개발사와의 공식 소통 창구로 활용되기도 합니다.',
  },
  {
    name: '뽐뿌 (Ppomppu)',
    category: '쇼핑 / 핫딜',
    description:
      '국내 최대 핫딜(특가 정보) 커뮤니티입니다. 국내외 쇼핑몰의 할인 정보, 쿠폰, 이벤트를 빠르게 공유하며, 해외직구 정보도 풍부합니다. "뽐뿌 게시판"에는 최신 핫딜이, "자유 게시판"에는 일상적인 이야기가 올라옵니다. 알뜰 소비를 추구하는 이용자들의 성지라고 할 수 있습니다.',
  },
  {
    name: '엠팍 (MLBPark)',
    category: '스포츠',
    description:
      '미국 메이저리그 야구(MLB) 관련 커뮤니티로 시작했으나, 현재는 KBO 한국 프로야구와 기타 스포츠, 시사 토론 등 다양한 주제를 다룹니다. "자유 게시판(BULLPEN)"이 가장 활발하며, 야구 관련 분석글과 팬들 간의 열띤 토론이 특징입니다.',
  },
  {
    name: '네이트판 (NatePann)',
    category: '일상 / 고민',
    description:
      '네이트에서 운영하는 커뮤니티 플랫폼으로, 일상 이야기와 고민 상담이 중심입니다. "톡톡" 게시판은 가벼운 일상글, "판" 게시판은 찬반 투표가 가능한 이슈 토론 공간입니다. 직장, 연애, 가족 관계 등 생활 밀착형 주제가 많아 공감대를 형성하기 좋습니다.',
  },
  {
    name: '보배드림 (Bobaedream)',
    category: '자동차',
    description:
      '한국 최대의 자동차 전문 커뮤니티입니다. 신차 리뷰, 중고차 시세, 정비 팁, 자동차 뉴스 등 차량 관련 종합 정보를 다룹니다. 자동차 구매를 고려할 때 실사용자들의 생생한 후기를 확인하기에 최적의 공간입니다. 자유 게시판에서는 시사 이슈도 활발하게 논의됩니다.',
  },
  {
    name: '82쿡 (82cook)',
    category: '생활 / 요리',
    description:
      '요리 레시피 공유에서 시작하여 현재는 자녀 교육, 부동산, 재테크, 생활 정보 전반을 다루는 여성 중심 커뮤니티입니다. 실생활에 유용한 정보와 경험담이 풍부하며, 교육 관련 정보 공유가 특히 활발합니다. 30~50대 기혼 여성 이용자가 주축입니다.',
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            한국 커뮤니티 완벽 가이드
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            각 커뮤니티의 특징과 문화, 어떤 정보를 얻을 수 있는지 알아보세요.
          </p>

          {/* 소개 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              한국 온라인 커뮤니티 생태계
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                한국의 온라인 커뮤니티 문화는 2000년대 초반부터 독자적인 생태계를 형성해왔습니다.
                네이버, 다음 같은 포털 카페에서 시작하여, 클리앙, 디시인사이드 같은 독립 커뮤니티로 분화되면서
                각각 고유한 문화와 이용자층을 갖게 되었습니다.
              </p>
              <p>
                IT 기기를 논하는 테크 커뮤니티, K-POP 팬덤이 모이는 엔터테인먼트 커뮤니티,
                핫딜 정보가 오가는 쇼핑 커뮤니티까지 — 관심사에 따라 자신에게 맞는 커뮤니티를
                찾는 것이 중요합니다. 각 커뮤니티마다 고유한 은어, 규칙, 분위기가 있으므로
                처음 방문할 때는 먼저 분위기를 파악하는 것이 좋습니다.
              </p>
              <p>
                {SITE_NAME}은 이러한 다양한 커뮤니티에서 화제가 되고 있는 인기 게시글만을
                선별하여 한곳에서 볼 수 있도록 만든 서비스입니다. 조회수, 댓글, 추천 수를
                종합적으로 분석하여 현재 가장 많은 관심을 받고 있는 글을 제공합니다.
              </p>
            </div>
          </section>

          {/* 커뮤니티 목록 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              주요 커뮤니티 소개
            </h2>
            <div className="space-y-4">
              {communities.map((community) => (
                <div
                  key={community.name}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {community.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {community.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {community.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 이용 팁 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              커뮤니티 이용 팁
            </h2>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">1. 분위기 파악이 먼저</h3>
                  <p>
                    각 커뮤니티마다 고유한 문화와 규칙이 있습니다. 처음 방문한 커뮤니티에서는
                    바로 글을 쓰기보다 인기 게시글을 먼저 읽으며 분위기를 파악하세요.
                    불문율을 어기면 부정적인 반응을 받을 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. 인기 게시글 활용하기</h3>
                  <p>
                    인기 게시글은 해당 커뮤니티에서 가장 많은 관심을 받은 콘텐츠입니다.
                    현재 어떤 주제가 화제인지, 커뮤니티 구성원들의 관심사가 무엇인지를
                    파악하는 데 유용합니다. {SITE_NAME}에서는 여러 커뮤니티의 인기글을
                    한번에 비교할 수 있어 전반적인 온라인 여론의 흐름을 읽을 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. 정보의 신뢰성 확인</h3>
                  <p>
                    온라인 커뮤니티의 정보는 검증되지 않은 개인 의견이 포함될 수 있습니다.
                    특히 건강, 법률, 금융 관련 정보는 전문가의 조언으로 반드시 재확인하세요.
                    여러 커뮤니티에서 동일한 주제가 논의될 때 다양한 시각을 비교해보는 것도 좋습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4. 카테고리별 커뮤니티 선택</h3>
                  <p>
                    IT 정보는 클리앙이나 SLR클럽, 게임 정보는 루리웹이나 인벤,
                    핫딜은 뽐뿌, 자동차는 보배드림처럼 주제별로 전문 커뮤니티를 활용하면
                    더 깊이 있는 정보를 얻을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              인기글 모아보기
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
