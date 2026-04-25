import { DashboardHome } from '@/components/dashboard-home';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const posts: StaticPost[] = postsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

export default function Home() {
  return (
    <>
      <DashboardHome initialPosts={posts} initialSites={sites} />
    </>
  );
}
