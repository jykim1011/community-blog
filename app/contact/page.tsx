import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: '문의하기',
  description: `${SITE_NAME} 서비스 관련 문의 및 피드백`,
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          문의하기
        </h1>

        <div className="space-y-6">
          {/* 문의 안내 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="mb-4">
              <strong>{SITE_NAME}</strong> 서비스에 대한 문의, 건의, 버그 신고 등을
              아래 채널을 통해 접수하실 수 있습니다.
            </p>
            <p className="text-sm">
              문의 접수 후 확인하는 대로 빠르게 답변드리겠습니다.
            </p>
          </div>

          {/* 문의 채널 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                GitHub Issues
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                버그 신고, 기능 요청, 개선 제안 등 기술적인 문의는 GitHub Issues를 통해
                접수해 주세요.
              </p>
              <a
                href="https://github.com/junyoung/community-blog/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Issues 페이지 열기
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                이메일
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                저작권 관련 문의, 게시글 삭제 요청, 비공개 문의 등은 이메일로
                보내주세요.
              </p>
              <a
                href="mailto:until2026@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                이메일 보내기
              </a>
            </div>
          </div>

          {/* 자주 묻는 질문 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5">
              자주 묻는 질문
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Q. 게시글은 얼마나 자주 업데이트되나요?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  30분마다 자동으로 각 커뮤니티의 인기 게시글을 수집합니다.
                  따라서 거의 실시간에 가까운 트렌드를 확인하실 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Q. 특정 게시글이나 커뮤니티를 삭제해주세요.
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  저작권 또는 기타 사유로 특정 콘텐츠의 삭제를 원하시면
                  이메일이나 GitHub Issues를 통해 요청해 주세요. 확인 후 신속하게 처리하겠습니다.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Q. 새로운 커뮤니티를 추가해줄 수 있나요?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  네, 추가를 원하시는 커뮤니티가 있다면 GitHub Issues를 통해 제안해 주세요.
                  검토 후 추가 여부를 결정하겠습니다.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Q. 앱은 어디서 다운로드할 수 있나요?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Android 앱은 Google Play Store에서 &quot;통합 커뮤니티&quot;로 검색하거나,
                  상단 메뉴의 &quot;앱 다운로드&quot; 버튼을 통해 설치하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
