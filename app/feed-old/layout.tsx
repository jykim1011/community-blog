import type { Metadata } from 'next';

// 사용자별 화면이라 검색 결과에 노출할 내용이 없다
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
