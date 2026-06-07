import { DashboardHome } from '@/components/dashboard-home';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import analysisData from '@/data/analysis.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const posts: StaticPost[] = postsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

const topKeywords = (analysisData as { keywords: { word: string }[] })
  .keywords.slice(0, 8)
  .map(k => ({ word: k.word }));

export default function Home() {
  return (
    <DashboardHome initialPosts={posts} initialSites={sites} keywords={topKeywords} />
  );
}
