import { SiteHeader } from '@/components/site-header';
import { HotPosts } from '@/components/hot-posts';
import hotPostsData from '@/data/posts-hot.json';
import type { StaticPost } from '@/lib/types';

export const metadata = { title: '🔥 지금 가장 뜨거운 글' };

// 인기 점수 상위 60건만 SSR. 나머지는 HotPosts 가 클라이언트에서 이어받는다.
const initialHotPosts = hotPostsData as StaticPost[];

export default function HotPage() {
  return (
    <>
      <SiteHeader />
      <HotPosts initialPosts={initialHotPosts} />
    </>
  );
}
