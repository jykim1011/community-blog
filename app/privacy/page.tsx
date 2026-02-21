import { SITE_NAME } from '@/lib/constants';

export const metadata = {
  title: `개인정보처리방침 | ${SITE_NAME}`,
  description: `${SITE_NAME} 개인정보처리방침`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          개인정보처리방침
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              1. 개인정보의 수집 및 이용
            </h2>
            <p className="mb-2">
              <strong>{SITE_NAME}</strong>은 별도의 회원가입 절차가 없으며,
              개인정보를 수집하지 않습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>이름, 이메일, 전화번호 등 개인식별정보 수집 없음</li>
              <li>로그인 기능 없음</li>
              <li>사용자가 직접 입력하는 정보 없음</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              2. 제공하는 서비스
            </h2>
            <p>
              {SITE_NAME}은 한국의 주요 커뮤니티 사이트의 인기 게시글을
              크롤링하여 통합 표시하는 서비스입니다. 모든 게시글은 원본
              사이트로 링크되며, 저작권은 해당 사이트 및 작성자에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              3. 쿠키 및 분석 도구
            </h2>
            <p className="mb-2">
              서비스 개선을 위해 다음의 도구를 사용할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Google Analytics (선택적, 익명화된 사용 통계)</li>
              <li>Cloudflare Web Analytics (IP 주소 저장 없음)</li>
            </ul>
            <p className="mt-2">
              이러한 도구는 개인을 식별할 수 없는 통계 정보만 수집합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              4. 광고
            </h2>
            <p>
              본 서비스는 Google AdMob/AdSense 광고를 표시할 수 있습니다.
              광고 제공을 위해 Google은 쿠키를 사용하여 사용자의 관심사 기반
              광고를 표시할 수 있습니다. 사용자는
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline ml-1"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 선택 해제할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              5. 외부 링크
            </h2>
            <p>
              본 서비스는 외부 커뮤니티 사이트로의 링크를 제공합니다.
              외부 사이트의 개인정보 처리는 해당 사이트의 정책을 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              6. 개인정보 보호책임자
            </h2>
            <p>
              본 서비스는 개인정보를 수집하지 않으나, 서비스 관련 문의사항은
              GitHub Issues를 통해 문의하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              7. 방침 변경
            </h2>
            <p>
              본 개인정보처리방침은 법령 및 서비스 변경에 따라 수정될 수 있으며,
              변경 시 본 페이지를 통해 공지됩니다.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>최종 수정일:</strong> 2026년 2월 21일
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
