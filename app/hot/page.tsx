import { SiteHeader } from '@/components/site-header';
import { HotPosts } from '@/components/hot-posts';
import hotPostsData from '@/data/posts-hot.json';
import type { StaticPost } from '@/lib/types';

export const metadata = {
  title: '지금 가장 뜨거운 글',
  description: '조회·댓글·추천이 빠르게 늘고 있는 한국 커뮤니티 인기글을 실시간으로 모아 보여줍니다.',
  alternates: { canonical: '/hot' },
};

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
