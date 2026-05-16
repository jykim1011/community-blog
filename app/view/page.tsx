import { Suspense } from 'react';
import { ViewerContent } from './viewer-content';

export default function ViewerPage() {
  return (
    <Suspense>
      <ViewerContent />
    </Suspense>
  );
}
