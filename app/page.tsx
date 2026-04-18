import { MainContent } from '@/components/main-content';
import { AdMobBanner } from '@/components/admob-banner';
import { BottomAdContainer } from '@/components/bottom-ad-container';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import postsData from '@/data/posts.json';
import sitesData from '@/data/sites.json';
import type { StaticPost, StaticSite } from '@/lib/types';

const posts: StaticPost[] = postsData as StaticPost[];
const sites: StaticSite[] = sitesData as StaticSite[];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 네비게이션 */}
      <SiteHeader />

      {/* 메인 컨텐츠 */}
      <MainContent initialPosts={posts} initialSites={sites} />

      {/* 하단 광고 */}
      <AdMobBanner position="bottom" />
      <BottomAdContainer />

      {/* 푸터 */}
      <SiteFooter />
    </div>
  );
}
