import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

// 검색 페이지는 클라이언트 컴포넌트라 metadata 를 직접 내보낼 수 없다.
export const metadata: Metadata = {
  title: '검색',
  description: `${SITE_NAME}에 모인 한국 커뮤니티 인기글을 제목·작성자·카테고리로 검색하세요.`,
  alternates: { canonical: `${SITE_URL}/search` },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
