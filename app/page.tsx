import { DashboardHome } from '@/components/dashboard-home';
import { AdMobBanner } from '@/components/admob-banner';
import { BottomAdContainer } from '@/components/bottom-ad-container';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const posts: StaticPost[] = postsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

export default function Home() {
  return (
    <>
      <DashboardHome initialPosts={posts} initialSites={sites} />
      <AdMobBanner position="bottom" />
      <BottomAdContainer />
    </>
  );
}
