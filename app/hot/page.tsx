import { SiteHeader } from '@/components/site-header';
import { HotPosts } from '@/components/hot-posts';
import postsData from '@/data/posts.json';
import type { StaticPost } from '@/lib/types';

export const metadata = { title: '🔥 지금 가장 뜨거운 글' };

export default function HotPage() {
  const posts = postsData as StaticPost[];
  const hotPosts = [...posts]
    .map(p => ({
      ...p,
      _score: (p.viewCount || 0) * 0.1 + (p.commentCount || 0) * 5 + (p.likeCount || 0) * 2,
    }))
    .sort((a, b) => b._score - a._score);

  return (
    <>
      <SiteHeader />
      <HotPosts posts={hotPosts} />
    </>
  );
}
