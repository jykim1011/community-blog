import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ViewerContent } from './viewer-content';

// 외부 글을 감싸 보여주는 화면이라 색인하지 않는다
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ViewerPage() {
  return (
    <Suspense>
      <ViewerContent />
    </Suspense>
  );
}
