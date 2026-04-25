'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { siteConfigs, categoryLabels, type SiteCategory } from '@/lib/constants';
import { SiteHeader } from '@/components/site-header';
import { adStateManager } from '@/lib/ad-state';

interface SiteWithCount {
  name: string;
  displayName: string;
  category: SiteCategory;
  totalCount: number;
}

// 사이트 도메인 매핑 (파비콘용)
const getSiteDomain = (siteName: string): string => {
  const domainMap: Record<string, string> = {
    clien: 'clien.net',
    theqoo: 'theqoo.net',
    ruliweb: 'ruliweb.com',
    dcinside: 'dcinside.com',
    inven: 'inven.co.kr',
    ppomppu: 'ppomppu.co.kr',
    mlbpark: 'mlbpark.donga.com',
    natepann: 'pann.nate.com',
    ilbe: 'ilbe.com',
    bobaedream: 'bobaedream.co.kr',
    etoland: 'etoland.co.kr',
    humoruniv: 'web.humoruniv.com',
    cook82: '82cook.com',
    slrclub: 'slrclub.com',
    gasengi: 'gasengi.com',
    hygall: 'gall.dcinside.com',
    todayhumor: 'todayhumor.co.kr',
    quasarzone: 'quasarzone.com',
    dvdprime: 'dvdprime.com',
    dealbada: 'dealbada.com',
    extmovie: 'extmovie.com',
    coolenjoy: 'coolenjoy.net',
  };
  return domainMap[siteName] || siteName;
};

export default function SettingsPage() {
  const router = useRouter();
  const { subscriptions, isLoaded, toggleSubscription, isSubscribed } = useSubscriptions();
  const [sitesData, setSitesData] = useState<SiteWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApp, setIsApp] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const mobilePadBottom =
    isApp && isAdLoaded
      ? 'calc(120px + max(env(safe-area-inset-bottom), 0px))'
      : 'calc(72px + max(env(safe-area-inset-bottom), 0px))';

  useEffect(() => {
    const isCapacitor =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'capacitor:' || (window as unknown as { Capacitor?: unknown }).Capacitor !== undefined);
    setIsApp(!!isCapacitor);
    return adStateManager.subscribe(setIsAdLoaded);
  }, []);

  useEffect(() => {
    // 모든 사이트 정보 로드 (dynamic import 사용)
    const loadSitesData = async () => {
      const sites: SiteWithCount[] = [];

      for (const [name, config] of Object.entries(siteConfigs)) {
        try {
          // dynamic import로 JSON 파일 로드
          const siteData = await import(`@/data/sites/${name}.json`);
          const data = siteData.default || siteData;

          sites.push({
            name,
            displayName: config.displayName,
            category: config.category,
            totalCount: data.totalCount || 0,
          });
        } catch (error) {
          // 파일이 없으면 기본값으로 추가
          sites.push({
            name,
            displayName: config.displayName,
            category: config.category,
            totalCount: 0,
          });
          console.warn(`No data for ${name}:`, error);
        }
      }

      // 카테고리별, 이름순 정렬
      sites.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.displayName.localeCompare(b.displayName);
      });

      setSitesData(sites);
      setLoading(false);
    };

    if (isLoaded) {
      loadSitesData();
    }
  }, [isLoaded]);

  // 카테고리별 그룹화
  const groupedSites = sitesData.reduce((acc, site) => {
    if (!acc[site.category]) {
      acc[site.category] = [];
    }
    acc[site.category].push(site);
    return acc;
  }, {} as Record<SiteCategory, SiteWithCount[]>);

  if (!isLoaded || loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 dark:bg-gray-950 max-sm:pb-[var(--settings-mobile-pb)]"
        style={{ ['--settings-mobile-pb' as string]: mobilePadBottom } as React.CSSProperties}
      >
        <SiteHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 max-sm:pb-[var(--settings-mobile-pb)]"
      style={{ ['--settings-mobile-pb' as string]: mobilePadBottom } as React.CSSProperties}
    >
      <SiteHeader />

      <main className="container mx-auto px-4 pt-8 max-w-4xl max-sm:pb-0 sm:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            커뮤니티 설정
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            메인 화면에 표시할 커뮤니티를 선택하세요
          </p>
        </div>

        {/* 선택 통계 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">선택한 커뮤니티</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {subscriptions.length === 0 ? '전체' : `${subscriptions.length}개`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {subscriptions.length === 0 ? '모든 커뮤니티가 표시됩니다' : '선택한 커뮤니티만 표시됩니다'}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              메인으로
            </button>
          </div>
        </div>

        {/* 카테고리별 사이트 목록 */}
        <div className="space-y-6">
          {Object.entries(groupedSites).map(([category, sites]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {categoryLabels[category as SiteCategory]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sites.map((site) => {
                  const subscribed = isSubscribed(site.name);
                  return (
                    <button
                      key={site.name}
                      onClick={() => toggleSubscription(site.name)}
                      className={`
                        flex items-center justify-between p-4 rounded-lg border-2 transition-all
                        ${
                          subscribed
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                          ${
                            subscribed
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }
                        `}
                        >
                          {subscribed && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${getSiteDomain(site.name)}&sz=32`}
                          alt=""
                          className="w-5 h-5 rounded-sm flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {site.displayName}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
