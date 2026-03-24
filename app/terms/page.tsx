import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: '이용약관',
  description: `${SITE_NAME} 서비스 이용약관`,
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          이용약관
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제1조 (목적)
            </h2>
            <p>
              본 약관은 <strong>{SITE_NAME}</strong>(이하 &quot;서비스&quot;)의 이용에 관한
              기본적인 사항을 정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제2조 (서비스의 내용)
            </h2>
            <p className="mb-2">서비스는 다음과 같은 기능을 제공합니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>한국 주요 온라인 커뮤니티의 인기 게시글 메타 정보(제목, 조회수, 댓글 수, 추천 수) 수집 및 표시</li>
              <li>원본 게시글로의 링크 제공</li>
              <li>커뮤니티별 필터링 및 정렬 기능</li>
              <li>모바일 앱 서비스</li>
            </ul>
            <p className="mt-2 text-sm">
              서비스는 게시글의 본문 내용을 직접 제공하지 않으며, 원본 사이트로의 연결만 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제3조 (저작권)
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
              <li>
                서비스에 표시되는 모든 게시글의 저작권은 해당 원본 커뮤니티 사이트와
                게시글 작성자에게 있습니다.
              </li>
              <li>
                서비스는 게시글의 제목과 메타 정보만을 수집하며, 이를 통해
                원본 사이트로의 접근을 용이하게 합니다.
              </li>
              <li>
                저작권 관련 문의나 삭제 요청은 문의 페이지를 통해 접수할 수 있으며,
                확인 즉시 조치합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제4조 (이용자의 의무)
            </h2>
            <p className="mb-2">이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 통해 수집한 정보를 무단으로 상업적으로 이용하는 행위</li>
              <li>자동화된 수단을 이용한 과도한 접근</li>
              <li>기타 관련 법령에 위배되는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제5조 (면책사항)
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
              <li>
                서비스는 외부 커뮤니티 사이트의 게시글 정보를 자동 수집하여 제공하므로,
                해당 콘텐츠의 정확성, 완전성, 적법성에 대해 보증하지 않습니다.
              </li>
              <li>
                외부 사이트의 서비스 변경, 중단 등으로 인한 정보 누락이나 오류에 대해
                책임을 지지 않습니다.
              </li>
              <li>
                이용자가 외부 링크를 통해 다른 사이트로 이동한 후 발생하는 문제에 대해
                서비스는 책임을 지지 않습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제6조 (광고)
            </h2>
            <p className="text-sm">
              서비스 운영을 위해 Google AdSense/AdMob 등의 광고가 게재될 수 있습니다.
              광고는 서비스의 지속적인 운영과 개선을 위한 수익원으로 활용됩니다.
              광고와 관련된 개인정보 처리는 개인정보처리방침에서 확인할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제7조 (서비스의 변경 및 중단)
            </h2>
            <p className="text-sm">
              서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있습니다.
              주요 변경 사항은 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              제8조 (약관의 변경)
            </h2>
            <p className="text-sm">
              본 약관은 관련 법령의 변경이나 서비스 정책 변경에 따라 수정될 수 있으며,
              변경 시 본 페이지를 통해 공지됩니다.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>시행일:</strong> 2026년 3월 24일
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
